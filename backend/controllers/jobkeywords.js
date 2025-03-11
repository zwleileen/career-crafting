const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const JobKeyword = require("../models/JobKeyword.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, careerPath, whyItFits, narrative } = req.body;
    if (!userId || !careerPath || !whyItFits || !narrative) {
      return res
        .status(400)
        .json({ message: "User ID and career path are required." });
    }

    const jobTitle =
      typeof careerPath === "string" ? careerPath : JSON.stringify(careerPath);
    const jobDetails =
      typeof whyItFits === "string" ? whyItFits : JSON.stringify(whyItFits);
    const jobNarrative =
      typeof narrative === "string" ? narrative : JSON.stringify(narrative);

    const newResponse = new JobKeyword({
      userId,
      jobTitle,
      jobDetails,
      jobNarrative,
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

    // const careerAnswers = await Career.findOne({
    //   userId: response.userId,
    // });
    // // console.log("careerAnswers retrieved:", careerAnswers);
    // const skillsAndExperiences = `Existing skills and experiences: ${careerAnswers.answers[3]}`;
    // console.log("Existing skills/experiences:", skillsAndExperiences);

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            You are an AI specializing in analyzing job roles to infer relevant industry keywords and essential skills keywords most commonly used in job descriptions in the market.  
            
            Based on the provided job title and reasons why the job role is suggested for the user, your tasks are to:
            1. Infer the most relevant industry categories and core skills required for success in this role. Be as comprehensive as possible. 
                Industry Keywords: Broad, standardized categories such as "Sustainability Consulting", "Tech Policy", "Corporate ESG" (Environmental, Social, Governance), etc.  
                Skills Keywords: Technical and soft skills necessary for this role, such as "Policy Development", "Stakeholder Engagement", "Sustainability Strategy", etc.  
            2. Describe a typical career path for this job role and industry, including any relevant academic qualifications and certifications, job roles or internships that may not be directly related to this job role but are highly relevant in acquiring the essential skills and experiences.

            Important: Present the response in structured JSON format as follows:
                {
                "industryKeywords": ["Sustainability Consulting", "Tech Policy", "Corporate ESG"],
                "skillsKeywords": ["Policy Development", "Stakeholder Engagement", "Sustainability Strategy"],
                "typicalPath": "A typical path for someone successful in this job role"
                }
            Do not return any extra text, just the JSON object. Be as comprehensive and relevant as possible. 
          `,
        },
        {
          role: "user",
          content: `Here is the job role suggested to me based on my career aspirations:\n${formattedAnswers}\nBased on these details, provide all THREE of these: the most relevant industry keywords related to the job role, the essential skills keywords related to the job role, as well as a typical path for someone successful in this job role.`,
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

    response.industryKeywords = parsedInsight.industryKeywords;
    response.skillsKeywords = parsedInsight.skillsKeywords;
    response.typicalPath = parsedInsight.typicalPath;
    await response.save();

    if (!parsedInsight || Object.keys(parsedInsight).length === 0) {
      return res.status(500).json({ message: "Failed to generate keywords." });
    }

    res.status(200).json({
      insight: parsedInsight,
      message: "Jobkeywords saved successfully",
    });
  } catch (error) {
    console.error("Error generating job keywords:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:responseId", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await JobKeyword.findById(responseId).populate(
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
