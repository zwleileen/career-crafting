const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const Career = require("../models/Career.js");
const ImagineIdeal = require("../models/ImagineIdeal.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const previous = await ImagineIdeal.findOne({ userId });
    console.log(previous);
    const worldVision = previous ? previous.worldVision : "";
    const valuesInsights = previous ? previous.valuesInsights : "";

    let existingResponse = await Career.findOne({ userId });

    if (existingResponse) {
      existingResponse.worldVision = worldVision;
      existingResponse.valuesInsights = valuesInsights;
      existingResponse.createdAt = new Date();
      await existingResponse.save();

      return res.status(200).json({
        message: "Responses updated successfully!",
        userId: existingResponse.userId,
        responseId: existingResponse._id,
      });
    } else {
      const newResponse = new Career({ userId, worldVision, valuesInsights });
      await newResponse.save();

      res.status(201).json({
        message: "Responses saved successfully!",
        userId: userId,
        responseId: newResponse._id,
      });
    }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Generate ChatGPT insights based on user responses
router.post("/results", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });

    // Fetch responses from MongoDB
    const response = await Career.findOne({ userId });
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    const previousInsightsText =
      response.worldVision && response.valuesInsights
        ? `\n\nInsights about my ideal career based on intrinsic values/strengths: ${response.valuesInsights} and my ideal world that I would like to contribute to shaping through my career: ${response.worldVision}.`
        : "";

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
          
            Important: Present the response succinctly in structured JSON format as follows:
                {
                "Summary": "Provide a succinct yet inspiring summary of the user's ideal world vision and how their intrinsic values and strengths position them uniquely to contribute towards shaping that ideal world.",
                "Possible career paths": [
                    {
                        "Career path": "Suggest the most relevant yet diverse career path that considers user's ideal career and ideal world. Make sure the career path is relevant, practical yet inspiring.",
                        "Why it fits": "Explain why this path/direction aligns with their unique profile and career aspirations. Suggest the ideal industry or department in which they can pursue this career path, the work environment and job tasks that are typical in such career.", 
                        "Narrative": "Suggest an encapsulating and inspiring storyline of a normal day in this career path, the types of stakeholders they work with, day-to-day tasks and the impact that the work has in shaping the ideal world. Be realistic, relatable and inspiring, and help user imagine themselves on this career path."
                    },
                    {
                        "Career path": "You must suggest a second career path that is still highly relevant to user's profile yet interestingly different and refreshing compared to the other suggested career paths.",
                        "Why it fits": "Explanation",
                        "Narrative": "Suggestion"
                    },
                    {
                        "Career path": "You must suggest a third career path that is still highly relevant to user's profile yet interestingly different and refreshing compared to the other suggested career paths.",
                        "Why it fits": "Explanation",
                        "Narrative": "Suggestion"
                    },
                                        {
                        "Career path": "You must suggest a fourth career path that is still highly relevant to user's profile yet interestingly different and refreshing compared to the other suggested career paths.",
                        "Why it fits": "Explanation",
                        "Narrative": "Suggestion"
                    },
                                        {
                        "Career path": "You must suggest a fifth career path that is still highly relevant to user's profile yet interestingly different and refreshing compared to the other suggested career paths.",
                        "Why it fits": "Explanation",
                        "Narrative": "Suggestion"
                    }
                ],
                }
            Do not return any extra text, just the JSON object. Be empathetic, encouraging, succinct and clear. Speak directly to the user, make them feel seen and understood, and be in awe at such brilliant suggestions and insights.
          `,
        },
        {
          role: "user",
          content: `Here are my inputs about the ideal world I want to contribute to shaping through my career: ${previousInsightsText}. What are the most relevant yet diverse career paths that satisfy my ideal career and allow me to shape my ideal world vision at the same time?`,
        },
      ],
      max_tokens: 1000,
      stop: null, //Prevents premature stopping
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const insight = chatResponse.choices[0].message.content;
    console.log("Raw AI Response (before saving):", insight);

    // Save AI insights as an object to MongoDB
    let parsedInsight;
    try {
      parsedInsight = JSON.parse(insight);
    } catch (err) {
      console.error("Error parsing AI response before saving:", err);
      parsedInsight = insight; //store as-is if already an object
    }

    response.careerPaths = parsedInsight;
    await response.save();

    res
      .status(200)
      .json({ insight, message: "Career paths saved successfully" });
  } catch (error) {
    console.error("Error generating career paths:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// router.get("/results", verifyToken, async (req, res) => {
//   try {
//     const response = await Status.findOne({ userId });

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
    const response = await Career.findOne({
      userId: req.params.userId,
    }).populate("userId", "username");

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    console.log("Raw AI Response:", response);

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error in GET /:userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
