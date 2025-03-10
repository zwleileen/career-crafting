const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const ImagineIdeal = require("../models/ImagineIdeal.js");
const Value = require("../models/Value.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { userId, worldVision } = req.body;

    const previousValue = await Value.findOne({ userId });
    const valuesInsights = previousValue.aiInsights;

    if (userId) {
      let existingResponse = await ImagineIdeal.findOne({ userId });

      if (existingResponse) {
        existingResponse.worldVision = worldVision;
        existingResponse.valuesInsights = valuesInsights;
        existingResponse.createdAt = new Date(); // Update timestamp
        await existingResponse.save();
        // console.log(existingResponse);

        return res.status(200).json({
          message: "Responses updated successfully!",
          responseId: existingResponse._id,
        });
      }
    }

    const newResponse = new ImagineIdeal({
      userId: userId || null,
      worldVision,
      valuesInsights,
    });
    await newResponse.save();

    res.status(201).json({
      message: "Ideal world saved successfully!",
      responseId: newResponse._id,
    });
    // }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/results", async (req, res) => {
  try {
    const { responseId } = req.body;

    // Fetch responses from MongoDB
    const response = await ImagineIdeal.findById(responseId);
    if (!response)
      return res.status(404).json({ message: "Response not found." });

    // Convert answers to string for ChatGPT
    const formattedAnswers = `Ideal world: ${response.worldVision}\nIdeal career: ${response.valuesInsights["Ideal career"]} based on intrinsic values and strengths: ${response.valuesInsights["Top values"]} and ${response.valuesInsights["Top strengths"]}.`;

    // Call OpenAI to analyze the responses
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
            Important: You are an expert in crafting cinematic, immersive, and emotionally compelling storytelling prompts for DALL·E. Your task is to generate ONE cinematic-style image with realistic, inspiring prompt that is optimized for high-quality image generation.  
            
            Goal:
            The prompt should instruct DALL·E to generate ONE highly realistic, relatable, and emotionally compelling image that immerses the viewer into the ideal career shaping the ideal world. This image must be gender neutral and should **evoke awe, inspiration, and a sense of purpose** by using **cinematic composition, dramatic lighting, and rich environmental storytelling**.
            
            Key Elements:
            - **Cinematic Composition:** Use depth of field, dynamic angles, rule of thirds, and leading lines.
            - **Lighting:** Natural authentic light, golden hour effects, or dramatic spotlighting.
            - **Texture & Detail:** Rich, realistic, tactile surfaces and authentic work environments.
            - **Lifelike Diversity:** Represent gender-neutral, inclusive, real-world settings.
            
            Output format:
            Return the response as a structured JSON object with no extra text, formatted exactly like this:
                {
                "Ideal world": "Generate detailed prompt for DALL·E...",
=                }
            `,
        },
        {
          role: "user",
          content: `Here are my ideal world and ideal career that is crafted based on my intrinsic values and strengths:\n${formattedAnswers}\n\n Based on these inputs, generate ONE **highly cinematic prompt** that encapsulate how my ideal career shapes the ideal world. Make the image detailed, immersive, and awe-inspiring.`,
        },
      ],
      max_tokens: 100,
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

    console.log("Generated Dall-E prompt:", JSON.stringify(parsedInsight));

    response.dallEPrompt = parsedInsight;
    await response.save();

    res.status(200).json({
      prompt: parsedInsight,
      message: "Dall-E prompt saved successfully",
    });
  } catch (error) {
    console.error("Error generating Dall-E prompt:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/image", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.body;

    const response = await ImagineIdeal.findById(responseId);
    if (!response || !response.dallEPrompt) {
      return res.status(404).json({ message: "Dall-E prompts not found" });
    }

    const idealWorldPrompt = response.dallEPrompt["Ideal world"];

    //function to generate image
    async function generateImage(prompt) {
      if (!prompt || prompt.trim() === "") {
        console.error(`Skipping image generation: Prompt is missing.`);
        return null; // Skip image generation if prompt is missing
      }

      try {
        const dallEResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1, // Generate 1 image
          size: "1024x1024",
          response_format: "url",
        });

        console.log(`Generated image URL:`, dallEResponse.data[0].url);
        return dallEResponse.data[0].url;
      } catch (error) {
        console.error("Error generating image backend:", error.message);
        return null;
      }
    }
    // Generate images for each prompt
    const idealWorldImage = await generateImage(idealWorldPrompt);

    // Ensure we do not overwrite existing data if an image fails
    response.dallEImage = idealWorldImage;

    await response.save();

    res.status(200).json({
      message: "DALL·E image generated successfully",
      image: response.dallEImage,
    });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ message: "Failed to generate images" });
  }
});

router.get("/image/:responseId", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await ImagineIdeal.findById(responseId);

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json({
      image: response.dallEImage,
    });
  } catch (err) {
    console.error("Error in GET /:responseId for image:", err);
    res.status(500).json({ err: err.message });
  }
});

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const responses = await ImagineIdeal.find({
      userId: req.params.userId,
    }).populate("userId", "username");

    if (!responses)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json(
      responses.map((response) => ({
        responseId: response._id,
        jobTitle: response.jobTitle,
        narrative: response.jobNarrative,
        images: response.dallEImages,
      }))
    );
  } catch (err) {
    console.error("Error in fetching responses by userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
