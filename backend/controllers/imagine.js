const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const ImagineCareer = require("../models/ImagineCareer.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, careerPath, whyItFits, narrative } = req.body;
    if (!userId || !careerPath || !whyItFits) {
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

    const newResponse = new ImagineCareer({
      userId,
      jobTitle,
      jobDetails,
      jobNarrative,
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
    const response = await ImagineCareer.findById(responseId);
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    // Convert answers to string for ChatGPT
    const formattedAnswers = `Job Title: ${response.jobTitle}\nWhy It Fits: ${response.jobDetails}\nA day in the job:${response.jobNarrative}`;

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            Important: You are an expert in crafting precise and effective prompts for DALL·E. Your task is to generate two separate cinematic-style image prompts that are structured, precise, and optimized for high-quality image generation. 
            
            Goal:
            The prompts should instruct DALL·E to generate two visually engaging images that are realistic yet aspirational, and should evoke inspiration and excitement about meaningful careers and societal change:
            1. A Day in the Job: A realistic, relatable and emotionally engaging scene depicting the professional in action.  
            2. Impact of the Work: A visual representation of the inspiring, positive transformation their work creates in society or the environment.  

            Output format:
            Return the response as a structured JSON object with no extra text, formatted exactly like this:
                {
                "A day in the job": "Generated prompt for DALL·E...",
                "Impact of the work": "Generated prompt for DALL·E..."
                }
            `,
        },
        {
          role: "user",
          content: `Here is the career path suggested to me based on my personal profile, career aspirations, existing skills and experiences:\n${formattedAnswers}\n\n Based on the job title and job narrative, generate two highly relatable and detailed DALL·E prompts: one describing a cinematic still of a "Day in the Job" and another depicting the "Impact of the Work."`,
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

    console.log("Generated Dall-E prompts:", JSON.stringify(parsedInsight));

    response.dallEPrompt = parsedInsight;
    await response.save();

    res.status(200).json({
      prompt: parsedInsight,
      message: "Dall-E prompts saved successfully",
    });
  } catch (error) {
    console.error("Error generating Dall-E prompts:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/images", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.body;

    const response = await ImagineCareer.findById(responseId);
    if (!response || !response.dallEPrompt) {
      return res.status(404).json({ message: "Dall-E prompts not found" });
    }

    const {
      "A day in the job": dayInJobPrompt,
      "Impact of the work": impactPrompt,
    } = response.dallEPrompt;

    //function to generate image
    async function generateImage(prompt) {
      const dallEResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1, // Generate 1 image
        size: "1024x1024", // Standard size, change if needed
        response_format: "url", // Returns a direct image URL
      });

      return dallEResponse.data[0].url;
    }

    //call the function
    const dayInJobImage = await generateImage(dayInJobPrompt);
    const impactImage = await generateImage(impactPrompt);

    //save image URLs to the database
    response.dallEImages = {
      dayInJob: dayInJobImage,
      impact: impactImage,
    };
    await response.save();

    res.status(200).json({
      message: "DALL·E images generated successfully",
      jobTitle: response.jobTitle,
      narrative: response.jobNarrative,
      images: response.dallEImages,
    });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ message: "Failed to generate images" });
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
