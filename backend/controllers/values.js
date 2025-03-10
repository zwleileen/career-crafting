const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const Value = require("../models/Value.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Save user responses
router.post("/", async (req, res) => {
  try {
    const { userId, answers, topValues, topStrengths } = req.body;

    // Check if a response already exists for this user
    if (userId) {
      let existingResponse = await Value.findOne({ userId });

      if (existingResponse) {
        existingResponse.answers = answers;
        existingResponse.topValues = topValues;
        existingResponse.topStrengths = topStrengths;
        existingResponse.createdAt = new Date(); // Update timestamp
        await existingResponse.save();
        console.log(existingResponse);

        return res.status(200).json({
          message: "Responses updated successfully!",
          responseId: existingResponse._id,
        });
      }
    }

    const newResponse = new Value({
      userId: userId || null,
      answers,
      topValues,
      topStrengths,
    });
    await newResponse.save();

    res.status(201).json({
      message: "Responses saved successfully!",
      responseId: newResponse._id,
    });
    // }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Generate ChatGPT insights based on user responses
router.post("/results", async (req, res) => {
  try {
    const { responseId } = req.body;

    // Fetch responses from MongoDB
    const response = await Value.findById(responseId);
    if (!response)
      return res.status(404).json({ message: "Response not found." });
    // console.log(response);

    // Convert answers from object to array format for ChatGPT
    const formattedAnswers = `
      Top Values: ${response.topValues.join(", ")}
      Top Strengths: ${response.topStrengths.join(", ")}
      `;
    console.log("Formatted answers sending to chatgpt:", formattedAnswers);

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            You are an expert career strategist and AI-powered coach specializing in career transitions, meaningful work, and life design. 
            You help professionals clarify their ideal work environment based on intrinsic values/strengths, as well as their work meaning based on their ideal world vision, then empower them to craft their ideal and meaningful career path by providing highly personalized, strategic, and practical career insights. 
            Your responses should feel like a mix of a career coach, psychologist, and industry mentor—blending self-awareness, motivation, and actionable guidance.
            Your goal is to analyze the user's responses and generate deeply insightful career reflections that make them feel seen, validated, and inspired, while also offering concrete next steps they can act on immediately.
          
            Important: Present the response in structured JSON format as follows:
            {
              "Top values": "Identify the user's core values & how they shape their work fulfillment.",
              "Top strengths": "Explain how their strengths make them unique & valuable in the workforce.",
              "Ideal career": "Highlight the intersection of their values + strengths in real-world career scenarios. Focus on describing the ideal work environment, impact of the work, job nature and relationships where they would flourish. Do not suggest job roles as we want to allow imagination and inspiration. Make this feel deep, thoughtful and empowering.",
            }
            IMPORTANT: Ensure your response is strictly valid JSON. Do not include any line breaks within the text values of your JSON fields.
            Do not return any extra text, just the JSON object. Be empathetic, encouraging, succinct and clear. Speak directly to the user, make them feel seen and understood, and be in awe at such brilliant suggestions and insights. Always end with a motivating statement that inspires action.          
            `,
        },
        {
          role: "user",
          content: `Here are my responses:\n${formattedAnswers}\nBased on my top strengths and values, how does my ideal career look like?`,
        },
      ],
      max_tokens: 500,
    });

    let insight = chatResponse.choices[0].message.content.trim();
    // console.log("Raw AI response from ChatGPT:", insight);

    try {
      insight = JSON.parse(insight);
      console.log("Parsed AI insights:", insight);
    } catch (error) {
      console.error("Failed to parse JSON from ChatGPT:", insight);
      return res.status(500).json({
        message: "Invalid AI response format",
        error: "AI response is not valid JSON",
      });
    }

    // Save in MongoDB as object
    response.aiInsights = insight;
    await response.save();

    res
      .status(200)
      .json({ insight, message: "AI insights saved successfully" });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/results/:responseId", async (req, res) => {
  try {
    const responseId = req.params.responseId;
    const response = await Value.findById(responseId);

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    const result = {
      _id: response._id,
      topValues: response.topValues,
      topStrengths: response.topStrengths,
      aiInsights: response.aiInsights,
      createdAt: response.createdAt,
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in GET /results/:responseId:", err);
    res.status(500).json({ err: err.message });
  }
});

router.put("/update/:responseId", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const { userId } = req.body;

    if (!userId || !responseId) {
      return res
        .status(400)
        .json({ message: "User ID and response ID are required." });
    }

    // Find the Value entry with the given responseId
    const updatedValue = await Value.findByIdAndUpdate(
      responseId, // Find by responseId
      { userId }, // Assign the new userId
      { new: true } // Return the updated document
    );

    if (!updatedValue) {
      return res
        .status(404)
        .json({ message: "No values found with the given responseId." });
    }

    res.status(200).json({
      message: "User ID successfully added to values.",
      updatedValue,
    });
  } catch (error) {
    console.error("Error updating values with userId:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const response = await Value.findOne({
      userId: req.params.userId,
    }).populate("userId", "username");

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    const chatResponse = response;
    // console.log("chatgpt response retrieved:", chatResponse);

    res.status(200).json(chatResponse);
  } catch (err) {
    console.error("Error in GET /:userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
