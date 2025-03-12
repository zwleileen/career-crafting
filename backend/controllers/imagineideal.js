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
            You are an AI assistant that generates **STRICTLY valid JSON** responses. 
            Your tasks are to: 
            1. Summarise the user's responses about their ideal world and ideal career into a short, inspiring paragraph that encapsulates the kind of work user flourishes in and how it shapes the ideal world. Make it inspiring and motivating for the user to embark on this ideal path. Speak directly to the user.
            2. Generate a structured JSON object that describes an inspiring, impressionistic-style prompt for DALL·E.  
            
            Rules for Dall-E image prompt:
            - The prompt should be brief and instruct DALL·E to generate ONE highly relatable and emotionally compelling panoramic image of the ideal world. 
            - This image should **evoke awe, inspiration, and a sense of purpose** by using **impressionistic-style composition and natural lighting**.
            - **Impressionistic-style composition with soft, natural, authentic lighting.
            - **Lifelike Diversity:** Represent gender-neutral, inclusive, real-world authentic settings.
            
            STRICTLY this output JSON format:
                {
                "summary": "Short inspiring summary of user's answers about ideal world and ideal career...",
                "ideal world": "DALL·E prompt for generate the image..."
                }
            Do not include any extra text before or after this JSON format. NO line breaks inside JSON values (Use space instead). Ensure JSON is complete.
            `,
        },
        {
          role: "user",
          content: `Here are my ideal world and ideal career that is crafted based on my intrinsic values and strengths:\n${formattedAnswers}\n\n Based on these inputs, provide BOTH of these: a summary of these inputs, and a Dall-E prompt in the exact JSON format request.`,
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

    console.log(
      "Generated Dall-E prompt and summary:",
      JSON.stringify(parsedInsight)
    );

    const formattedInsight = Object.fromEntries(
      Object.entries(parsedInsight).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    ); //Object.fromEntries converts array back to object

    response.dallEPrompt["summary"] = formattedInsight["summary"];
    response.dallEPrompt["ideal world"] = formattedInsight["ideal world"];
    await response.save();

    res.status(200).json({
      prompt: parsedInsight,
      message: "Dall-E prompt and summary saved successfully",
    });
  } catch (error) {
    console.error("Error generating Dall-E prompt and summary:", error);
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

    const idealWorldPrompt = response.dallEPrompt["ideal world"];

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

router.get("/results/:referenceId", async (req, res) => {
  try {
    const { referenceId } = req.params;
    const response = await ImagineIdeal.findOne({ referenceId });

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json({
      summary: response.dallEPrompt["summary"],
    });
  } catch (err) {
    console.error("Error in GET for summary:", err);
    res.status(500).json({ err: err.message });
  }
});

router.put("/updateId/:referenceId", verifyToken, async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { userId } = req.body;

    if (!userId || !referenceId) {
      return res
        .status(400)
        .json({ message: "User ID and response ID are required." });
    }

    // Find the Value entry with the given responseId
    const updatedImagineIdeal = await ImagineIdeal.findOne({ referenceId });
    updatedImagineIdeal.userId = userId;
    updatedImagineIdeal.save();

    if (!updatedImagineIdeal) {
      return res
        .status(404)
        .json({ message: "No ideal found with the given responseId." });
    }

    res.status(200).json({
      message: "User ID successfully added to imagine ideal.",
      updatedImagineIdeal,
    });
  } catch (error) {
    console.error("Error updating ideal with userId:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const response = await ImagineIdeal.find({
      userId: req.params.userId,
    }).populate("userId", "username");

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in fetching responses by userId:", err);
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
