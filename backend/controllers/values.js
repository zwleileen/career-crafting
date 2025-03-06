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
    if (!userId || !answers) {
      return res
        .status(400)
        .json({ message: "User ID and answers are required." });
    }

    // Check if a response already exists for this user
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
    } else {
      const newResponse = new Value({
        userId,
        answers,
        topValues,
        topStrengths,
      });
      await newResponse.save();

      res.status(201).json({
        message: "Responses saved successfully!",
        responseId: newResponse._id,
      });
    }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Generate ChatGPT insights based on user responses
router.post("/results", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });

    // Fetch responses from MongoDB
    const response = await Value.findOne({ userId });
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
            You help professionals clarify their values, strengths, and career direction by providing highly personalized, strategic, and practical career insights. 
            Your responses should feel like a mix of a career coach, psychologist, and industry mentor—blending self-awareness, motivation, and actionable guidance.
            Your goal is to analyze the user's responses and generate deeply insightful career reflections that make them feel seen, validated, and inspired, while also offering concrete next steps they can act on immediately.
          
            Important: Present the response in structured JSON format as follows:
            {
              "Top values": "Identify the user's core values & how they shape their work fulfillment.",
              "Top strengths": "Explain how their strengths make them unique & valuable in the workforce.",
              "Ideal career": "Highlight the intersection of their values + strengths in real-world career scenarios. Focus on describing the ideal work environment, impact of the work, job nature and relationships where they would flourish. Do not suggest job roles as we want to allow imagination and inspiration. Make this feel deep, thoughtful and empowering.",
            }
            Do not return any extra text, just the JSON object. Be empathetic, encouraging, succinct and clear. Speak directly to the user, make them feel seen and understood. Blend expert-level career advice with personal coaching style insights. Always end with a motivating statement that inspires action.
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

    // Check if response ends properly
    if (!insight.endsWith("}")) {
      console.error("Incomplete JSON response from ChatGPT:", insight);
      insight += "}"; // Try appending a closing brace (temporary fix)
    }

    try {
      insight = JSON.parse(insight);
      console.log("Parsed AI insights:", insight);
    } catch (error) {
      console.error("Failed to parse JSON from ChatGPT:", insight);
      insight = {}; // Avoid saving broken JSON
    }

    // Convert to a string before saving to MongoDB
    response.aiInsights = JSON.stringify(insight);
    await response.save();

    res
      .status(200)
      .json({ insight, message: "AI insights saved successfully" });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// router.get("/results", verifyToken, async (req, res) => {
//   try {
//     const response = await Value.findOne({ userId });

//     if (!response)
//       return res.status(404).json({ message: "Response not found." });

//     const chatResponse = response.aiInsights;
//     console.log(chatResponse);

//     res.status(200).json(chatResponse);
//   } catch (err) {
//     console.error("Error in GET /results:", err);
//     res.status(500).json({ err: err.message });
//   }
// });

router.get("/:userId", verifyToken, async (req, res) => {
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
