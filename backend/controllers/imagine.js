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
            Important: You are an expert in crafting cinematic, immersive, and emotionally compelling storytelling prompts for DALL·E. Your task is to generate three separate cinematic-style image with realistic, inspiring storytelling prompts that are optimized for high-quality image generation.  
            
            Goal:
            The prompts should instruct DALL·E to generate three **highly realistic, relatable, and emotionally compelling** images that immerse the viewer into the world of this professional. These images should **evoke awe, inspiration, and a sense of purpose** by using **cinematic composition, dramatic lighting, and rich environmental storytelling**.
            
            Key Elements:
            - **Narrative Flow**: Each prompt should **read like a short story** about the professional’s daily life.
            - **Cinematic Composition:** Use depth of field, dynamic angles, rule of thirds, and leading lines.
            - **Lighting:** Natural authentic light, golden hour effects, or dramatic spotlighting.
            - **Human Emotion & Engagement:** Describe expressions, body language, interaction with stakeholders.
            - **Texture & Detail:** Rich, realistic, tactile surfaces and authentic work environments.
            - **Lifelike Diversity:** Represent inclusive, real-world people and settings.
            
            Scenes to Generate:
            1. A morning in the job: Describe a specific moment in the professional's morning
            - A realistic, immersive scene showing the professional in action at the start of their day.  
            - Highlight **a specific task**, such as strategizing, designing, problem-solving, or leading discussions.  
            - Show the **types of stakeholders they work with** (e.g., investors, engineers, policymakers, community members).  
            - **Setting:** Office, fieldwork, innovation hub, courtroom, or any relevant location.  
            - Capture **expressions, body language, and work atmosphere** to create a strong emotional connection.

            2. An afternoon in the job: Describe a different moment later in the day highlighting different aspect of their role
            - A different, dynamic moment in their workday that contrasts with the morning.  
            - Focus on **another key task or challenge**—e.g., presenting, negotiating, testing a prototype, mentoring a team.  
            - Include **different interactions** (e.g., clients, communities, high-stakes decision-makers).  
            - Use a **new setting** (e.g., conference hall, remote site, urban setting, factory floor).  
            - Emphasize **cinematic lighting and a sense of urgency or energy**.            
            
            3. Impact of the work: Describe the impact of the professional's work at the end of the day
            - A **visual transformation** showcasing the real-world effect of their efforts.  
            - Contrast the **"before and after"** impact in a striking, cinematic way.  
            - Examples:  
                - A once-polluted city now lush and green due to sustainability policies.  
                - A thriving startup hub created by the entrepreneur's vision.  
                - A rural village empowered by new technology, education, or infrastructure.  
            - Capture **emotion, scale, and societal change** to create a sense of awe and admiration.
            
            Output format:
            Return the response as a structured JSON object with no extra text, formatted exactly like this:
                {
                "A morning in the job": "A 2-liner summary of the storytelling prompt for DALL·E...",
                "An afternoon in the job": "A 2-liner summary of the storytelling prompt for DALL·E...",
                "Impact of the work": "A 2-liner summary of the storytelling prompt for DALL·E..."
                }
            `,
        },
        {
          role: "user",
          content: `Here is the career path suggested to me based on my personal profile, career aspirations, existing skills and experiences:\n${formattedAnswers}\n\n Based on my gender, job title and job narrative, generate three **highly cinematic storytelling prompts** that bring my career journey to life: one for "A morning in the job," another for "An afternoon in the job," and lastly for "The impact of the work." Make them detailed, immersive, and awe-inspiring.`,
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
        console.error("Error generating images backend:", error.message);
        return null;
      }
    }
    // Generate images for each prompt
    const morningInJobImage = await generateImage(morningInJobPrompt);
    const afternoonInJobImage = await generateImage(afternoonInJobPrompt);
    const impactImage = await generateImage(impactPrompt);

    // Ensure we do not overwrite existing data if an image fails
    response.dallEImages = {
      morningInJob: {
        url: morningInJobImage || response.dallEImages?.morningInJob?.url,
        prompt:
          morningInJobPrompt || response.dallEImages?.morningInJob?.prompt,
      },
      afternoonInJob: {
        url: afternoonInJobImage || response.dallEImages?.afternoonInJob?.url,
        prompt:
          afternoonInJobPrompt || response.dallEImages?.afternoonInJob?.prompt,
      },
      impact: {
        url: impactImage || response.dallEImages?.impact?.url,
        prompt: impactPrompt || response.dallEImages?.impact?.prompt,
      },
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

router.get("/images/:responseId", verifyToken, async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await ImagineCareer.findById(responseId);

    if (!response)
      return res.status(404).json({ message: "Response not found." });

    res.status(200).json({
      jobTitle: response.jobTitle,
      narrative: response.jobNarrative,
      images: response.dallEImages,
    });
  } catch (err) {
    console.error("Error in GET /:responseId for images:", err);
    res.status(500).json({ err: err.message });
  }
});

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const responses = await ImagineCareer.find({
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
