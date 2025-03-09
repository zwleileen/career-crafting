const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const ImagineCareer = require("../models/ImagineCareer.js");
const User = require("../models/User.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, careerPath, whyItFits, narrative } = req.body;

    const user = await User.findById(userId);
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
      gender: user.gender,
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
    const formattedAnswers = `Job Title: ${response.jobTitle}\nWhy It Fits: ${response.jobDetails}\nA day in the job:${response.jobNarrative}\nGender of professional:${response.gender}`;

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            Important: You are an expert in crafting precise and effective prompts for DALL·E. Your task is to generate three separate impressionistic-style image prompts that are structured, precise, and optimized for high-quality image generation. 
            
            Goal:
            The prompts should instruct DALL·E to generate three visually engaging images that are realistic, relatable yet aspirational, and should evoke inspiration and excitement about meaningful careers and societal change:
            1. A morning in the job: A realistic, relatable and emotionally engaging scene depicting the professional in action in a typical morning at work.  
            2. An afternoon in the job: A realistic, relatable and emotionally engaging scene depicting the professional in action in a typical afternoon.  
            2. Impact of the work: A visual representation of the inspiring, positive transformation their work creates in society or the environment at the end of the day.  

            Output format:
            Return the response as a structured JSON object with no extra text, formatted exactly like this:
                {
                "A morning in the job": "Generated prompt for DALL·E...",
                "An afternoon in the job": "Generated prompt for DALL·E...",
                "Impact of the work": "Generated prompt for DALL·E..."
                }
            `,
        },
        {
          role: "user",
          content: `Here is the career path suggested to me based on my personal profile, career aspirations, existing skills and experiences:\n${formattedAnswers}\n\n Based on my gender, job title and job narrative, generate three highly relatable and detailed DALL·E prompts describing a day in the job: one describing an impressionistic style of "A morning in the job", another describing "An afternoon in the job" and lastly depicting the "Impact of the work".`,
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
      "A morning in the job": morningInJobPrompt,
      "An afternoon in the job": afternoonInJobPrompt,
      "Impact of the work": impactPrompt,
    } = response.dallEPrompt;

    //function to generate image
    async function generateImage(prompt) {
      try {
        const dallEResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1, // Generate 1 image
          size: "1024x1024",
          response_format: "url",
        });

        if (!dallEResponse.data || dallEResponse.data.length === 0) {
          throw new Error("DALL·E response does not contain any images.");
        }
        console.log("Generated image URL:", dallEResponse.data[0].url);

        return dallEResponse.data[0].url;
      } catch (error) {
        console.error("Error generating images backend:", error.message);
        return null;
      }
    }
    //call the function
    const [morningInJobImage, afternoonInJobImage, impactImage] =
      await Promise.all([
        generateImage(morningInJobPrompt),
        generateImage(afternoonInJobPrompt),
        generateImage(impactPrompt),
      ]);

    // Ensure we do not overwrite existing data if an image fails
    response.dallEImages = {
      morningInJob: morningInJobImage || response.dallEImages?.morningInJob,
      afternoonInJob:
        afternoonInJobImage || response.dallEImages?.afternoonInJob,
      impact: impactImage || response.dallEImages?.impact,
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
