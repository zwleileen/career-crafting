const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const ImagineIdeal = require("../models/ImagineIdeal.js");
const Value = require("../models/Value.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { userId, responseId, worldVision } = req.body;
    // console.log(responseId);

    const previousValue = await Value.findById(responseId);
    // console.log(previousValue);
    const valuesInsights = previousValue.valuesInsights;
    const referenceId = previousValue._id;

    if (userId) {
      let existingResponse = await ImagineIdeal.findOne({ userId });

      if (existingResponse) {
        existingResponse.referenceId = referenceId;
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
      referenceId,
      userId: userId || null,
      worldVision,
      valuesInsights,
    });
    await newResponse.save();

    res.status(201).json({
      message: "Ideal world saved successfully!",
      responseId: newResponse._id,
      referenceId: newResponse.referenceId,
    });
    // }
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/results", async (req, res) => {
  try {
    const { referenceId } = req.body;

    // Fetch responses from MongoDB
    const response = await ImagineIdeal.findOne({ referenceId });
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
            Important: You are an AI assistant that generates **STRICTLY valid JSON** responses. Your task is to create a structured JSON object that describes an immersive, cinematic prompt for DALL·E.  
            The prompt should be brief and instruct DALL·E to generate ONE highly realistic, relatable, and emotionally compelling image that immerses the viewer into the ideal career shaping the ideal world. This image must be gender neutral and should **evoke awe, inspiration, and a sense of purpose** by using **cinematic composition, dramatic lighting, and rich environmental storytelling**.
            
            Rules for response formatting:
            - **ONLY return valid JSON** (Do not include any extra text before or after the JSON).
            - **NO line breaks inside JSON values** (Use space instead).
            - **ENSURE JSON is complete** (No missing brackets).
            - **Cinematic Composition:** Use depth of field, dynamic angles, rule of thirds, and leading lines.
            - **Lighting:** Natural authentic light, golden hour effects, or dramatic spotlighting.
            - **Texture & Detail:** Rich, realistic, tactile surfaces and authentic work environments.
            - **Lifelike Diversity:** Represent gender-neutral, inclusive, real-world settings.
            
            STRICTLY this output format:
                {
                "Ideal world": "Generate prompt for DALL·E...",
                }
            Do not exceed 250 tokens.
            `,
        },
        {
          role: "user",
          content: `Here are my ideal world and ideal career that is crafted based on my intrinsic values and strengths:\n${formattedAnswers}\n\n Based on these inputs, generate ONE **highly cinematic prompt** that encapsulate how my ideal career shapes the ideal world. Make the image detailed, immersive, and awe-inspiring.`,
        },
      ],
      max_tokens: 300,
    });

    const insight = chatResponse.choices[0].message.content;

    //Ensure valid JSON before saving
    let parsedInsight;
    try {
      parsedInsight = JSON.parse(insight);
    } catch (e) {
      console.error("Error parsing ChatGPT response:", e);
      // Attempt to clean up JSON before retrying
      const cleanedInsight = insight
        .replace(/[\n\r]/g, "") // Remove newlines
        .replace(/([{,])\s*([^":\s]+)\s*:/g, '$1"$2":') // Fix missing quotes around keys
        .replace(/:\s*([^",\]\}]+)\s*([,\}])/g, ': "$1"$2'); // Fix missing quotes around values

      try {
        parsedInsight = JSON.parse(cleanedInsight);
      } catch (secondError) {
        console.error("Failed to parse JSON even after cleanup:", secondError);
        parsedInsight = {}; // Prevent saving broken JSON
      }
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

router.post("/image", async (req, res) => {
  try {
    const { referenceId } = req.body;

    const response = await ImagineIdeal.findOne({ referenceId });
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

router.get("/image/:referenceId", async (req, res) => {
  try {
    const { referenceId } = req.params;
    const response = await ImagineIdeal.findOne({ referenceId });

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
