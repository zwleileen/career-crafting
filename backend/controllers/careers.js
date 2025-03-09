const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const Career = require("../models/Career.js");
const Value = require("../models/Value.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, answers } = req.body;
    if (!userId || !answers) {
      return res
        .status(400)
        .json({ message: "User ID and answers are required." });
    }

    const previousValue = await Value.findOne({ userId });
    const valuesInsights = previousValue ? previousValue.aiInsights : "";

    // Check if a response already exists for this user
    let existingResponse = await Career.findOne({ userId });

    if (existingResponse) {
      existingResponse.answers = answers;
      existingResponse.valuesInsights = valuesInsights;
      existingResponse.createdAt = new Date();
      await existingResponse.save();

      return res.status(200).json({
        message: "Responses updated successfully!",
        responseId: existingResponse._id,
      });
    } else {
      const newResponse = new Career({ userId, answers, valuesInsights });
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
router.post("/results", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });

    // Fetch responses from MongoDB
    const response = await Career.findOne({ userId });
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    // Convert answers from object to array format for ChatGPT
    const formattedAnswers = Object.entries(response.answers)
      .map(([questionId, answer]) => {
        return `Question ${questionId}: ${answer})`;
      })
      .join("\n");

    const previousInsightsText = response.valuesInsights
      ? `\n\nPrevious insights about my ideal career based on intrinsic values/strengths: ${response.valuesInsights}`
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
                "Summary": "Provide a succinct yet inspiring summary of the user's ideal world vision and how their intrinsic values and strengths position them uniquely to contribute towards shaping that ideal world. Acknowledge user's career challenges, but assure and encourage them that they will be able to overcome these challenges. Make it emotionally resonant, compelling, and inspiring.",
                "Possible career paths": [
                    {
                        "Career path": "Suggest the most relevant yet diverse career direction/path that balances user's ideal career with user's career challenges and existing skills/experiences. Make sure the career path considers user's years of work experience or the seniority level, in order for it to be practical yet inspiring.",
                        "Why it fits": "Explain why this path/direction aligns with their unique profile and career aspirations, while addressing their practical career challenges. Suggest the ideal industry or department in which they can pursue this career path, the work environment and job tasks that are typical in such career.", 
                        "Narrative": "Suggest a storyline of a normal day in this career path, the types of stakeholders they work with, day-to-day tasks and the impact that the work has in shaping the ideal world. Be realistic, relatable and inspiring, and help user imagine themselves on this career path."
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
          content: `Here are the impact I want to make, my career challenges, as well as existing skills and experiences:\n${formattedAnswers}\nBased on this and ${previousInsightsText}, what are the most relevant yet diverse career paths that satisfy me ideal career and allow me to shape my ideal world vision at the same time?`,
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

    response.aiInsights = parsedInsight;
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

    let chatResponse = response.aiInsights;
    console.log("Raw AI Response:", chatResponse);

    return res.status(200).json(chatResponse);
  } catch (err) {
    console.error("Error in GET /:userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
