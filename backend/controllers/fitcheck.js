const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const FitCheck = require("../models/FitCheck.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      return res
        .status(400)
        .json({ message: "User ID and answers are required." });
    }

    const previous = await ImagineIdeal.findOne({ userId });
    console.log(previous);
    const worldVision = previous ? previous.worldVision : "";
    const valuesInsights = previous ? previous.valuesInsights : "";

    let existingResponse = await FitCheck.findOne({ userId });

    if (existingResponse) {
      existingResponse.worldVision = worldVision;
      existingResponse.valuesInsights = valuesInsights;
      existingResponse.careerStatus = answers;
      existingResponse.createdAt = new Date(); // Update timestamp
      await existingResponse.save();
      console.log(existingResponse);

      return res.status(200).json({
        message: "Responses updated successfully!",
        userId: userId,
        responseId: existingResponse._id,
      });
    }

    const newResponse = new FitCheck({
      userId,
      worldVision,
      valuesInsights,
      careerStatus: answers,
    });
    await newResponse.save();

    res.status(201).json({
      message: "Selected career path saved successfully!",
      userId: userId,
      responseId: newResponse._id,
    });
    // }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Generate ChatGPT insights based on user responses
router.post("/results", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.body;

    // Fetch responses from MongoDB
    const response = await FitCheck.findById(responseId);
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    // Convert answers to string for ChatGPT
    const formattedAnswers = `Ideal world: ${response.worldVision}\nIdeal career based on intrinsic values/strengths: ${response.valuesInsights}\nCareer considerations and skills/experiences:${response.careerStatus}.`;

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
              "summary": "Provide insights on alignment of user's ideal career and ideal world with their existing skills/experiences and career considerations. Make the insights practical, succinct and clear, so that they know clearly where the fit/alignment and gaps are.",
            }
            IMPORTANT: Ensure your response is strictly valid JSON. Do not include any line breaks within the text values of your JSON fields.
            Do not return any extra text, just the JSON object. Be empathetic, encouraging, succinct and clear. Speak directly to the user, make them feel seen and understood, and be in awe at such brilliant suggestions and insights. Always end with a motivating statement that inspires action.          
          `,
        },
        {
          role: "user",
          content: `Here are my inputs regarding my career aspirations, desired impact on the world, existing career considerations, challenges and skills/experiences:\n${formattedAnswers}\nBased on these details, provide insights on alignment of my ideal career and ideal world based on intrinsic values/strengths with my existing career skills/experiences and other career considerations. Make the insights practical, succinct and clear, so that I know clearly where the fit/alignment and gaps are.`,
        },
      ],
      max_tokens: 500,
    });

    const insight = chatResponse.choices[0].message.content;

    //Ensure valid JSON before saving
    let parsedInsight;
    try {
      parsedInsight = JSON.parse(insight);
    } catch (e) {
      console.error("Error parsing ChatGPT response:", e);
      parsedInsight = {}; // Prevent saving broken JSON
    }

    console.log("Sending response to frontend:", JSON.stringify(parsedInsight));

    response.summary = parsedInsight;
    await response.save();

    if (!parsedInsight || Object.keys(parsedInsight).length === 0) {
      return res
        .status(500)
        .json({ message: "Failed to generate insights summary." });
    }

    res.status(200).json({
      insight: parsedInsight,
      message: "insights summary saved successfully",
    });
  } catch (error) {
    console.error("Error generating insights summary:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:responseId", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await FitCheck.findById(responseId).populate(
      "userId",
      "username"
    );

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in GET /:responseId:", err);
    res.status(500).json({ err: err.message });
  }
});

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const response = await FitCheck.findOne({
      userId: req.params.userId,
    }).populate("userId", "username");

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in GET /:userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
