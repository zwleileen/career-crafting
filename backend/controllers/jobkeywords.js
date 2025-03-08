const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const Career = require("../models/Career.js");
const JobKeyword = require("../models/JobKeyword.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, careerPath, whyItFits } = req.body;
    if (!userId || !careerPath || !whyItFits) {
      return res
        .status(400)
        .json({ message: "User ID and career path are required." });
    }

    const jobTitle =
      typeof careerPath === "string" ? careerPath : JSON.stringify(careerPath);
    const jobDetails =
      typeof whyItFits === "string" ? whyItFits : JSON.stringify(whyItFits);

    const newResponse = new JobKeyword({
      userId,
      jobTitle,
      jobDetails,
      industryKeywords: [],
      skillsKeywords: [],
    });
    await newResponse.save();

    res.status(201).json({
      message: "Selected career path saved successfully!",
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
    const response = await JobKeyword.findById(responseId);
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    // Convert answers to string for ChatGPT
    const formattedAnswers = `Job Title: ${response.jobTitle}\nWhy It Fits: ${response.jobDetails}`;

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            You are an AI specializing in analyzing job roles to infer relevant industry keywords and essential skills keywords most commonly used in job descriptions in order to match with the most relevant jobs in the market.  
  
            Based on the provided job title and reasons why the job role is suggested for the user, infer the most relevant industry categories and core skills required for success in this role. Be as comprehensive as possible. 
            Industry Keywords: Broad, standardized categories such as "Sustainability Consulting", "Tech Policy", "Corporate ESG" (Environmental, Social, Governance), etc.  
            Skills Keywords: Technical and soft skills necessary for this role, such as "Policy Development", "Stakeholder Engagement", "Sustainability Strategy", etc.  

            Important: Present the response in structured JSON format as follows:
                {
                "industryKeywords": ["Sustainability Consulting", "Tech Policy", "Corporate ESG"],
                "skillsKeywords": ["Policy Development", "Stakeholder Engagement", "Sustainability Strategy"]
                }
            Do not return any extra text, just the JSON object. 
          `,
        },
        {
          role: "user",
          content: `Here is the job role that have been suggested to me based on my personal profile, career aspirations, existing skills and experiences:\n${formattedAnswers}\nBased on the job title and job details, what are the most common and relevant industry keywords and essential skills keywords so that I can match them with the most relevant jobs?`,
        },
      ],
      max_tokens: 150,
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

    response.industryKeywords = parsedInsight.industryKeywords;
    response.skillsKeywords = parsedInsight.skillsKeywords;
    await response.save();

    if (!parsedInsight || Object.keys(parsedInsight).length === 0) {
      return res.status(500).json({ message: "Failed to generate keywords." });
    }

    res.status(200).json({
      insight: parsedInsight,
      message: "AI insights saved successfully",
    });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// router.get("/results", verifyToken, async (req, res) => {
//   try {
//     const response = await JobRole.findOne({ userId });

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
    const response = await JobKeyword.findOne({
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
