const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const JobKeyword = require("../models/JobKeyword.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const API_URL = "https://api.adzuna.com/v1/api/jobs";

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const jobKeywords = await JobKeyword.findOne({ userId });
    if (
      !jobKeywords ||
      !jobKeywords.industryKeywords ||
      !jobKeywords.skillsKeywords
    ) {
      return res.status(404).json({ message: "Job keywords not found." });
    }

    const searchQuery = [
      ...new Set([
        ...jobKeywords.industryKeywords,
        ...jobKeywords.skillsKeywords,
      ]),
    ].join(" "); //Set() removes duplicates when array is converted in Set, which returns an object, so we need to spread the object to convert it back into an array
    console.log("Search query:", searchQuery);

    const adzunaUrl = `${API_URL}/sg/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what_or=${encodeURIComponent(
      searchQuery
    )}&results_per_page=10`;

    console.log("Searching Adzuna with URL:", adzunaUrl);

    const response = await fetch(adzunaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const matchedJobs = await response.json();
    if (matchedJobs.count === 0) {
      console.log("No jobs found for the given keywords.");
      return res.status(404).json({ message: "No jobs found." });
    }

    res.status(200).json(matchedJobs.results);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
