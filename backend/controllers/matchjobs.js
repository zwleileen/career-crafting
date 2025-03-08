const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const verifyToken = require("../middleware/verify-token");
const JobKeyword = require("../models/JobKeyword.js");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const API_URL = "https://api.adzuna.com/v1/api/jobs";

router.get("/results/:responseId", verifyToken, async (req, res) => {
  try {
    const responseId = req.params.responseId;
    const jobKeywords = await JobKeyword.findById(responseId);
    if (
      !jobKeywords ||
      !jobKeywords.industryKeywords ||
      !jobKeywords.skillsKeywords
    ) {
      return res.status(404).json({ message: "Job keywords not found." });
    }

    const keywordSet = new Set([
      ...jobKeywords.industryKeywords,
      ...jobKeywords.skillsKeywords,
    ]);
    const keywords = [...keywordSet].map((word) => word.toLowerCase()); // Convert to lowercase for case-insensitive matching
    const searchQuery = keywords.join(" ");
    //Set() removes duplicates when array is converted in Set, which returns an object, so we need to spread the object to convert it back into an array
    console.log("Search query:", searchQuery);

    let allJobs = [];
    const resultsPerPage = 50; // Maximize efficiency
    const maxPages = 5; //adjustable
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); //Adzuna has restrictions on how may requests sent per min/hr, hence have to add a delay between each request

    for (let page = 1; page <= maxPages; page++) {
      await delay(500); // wait 500ms before fetching next page
      const adzunaUrl = `${API_URL}/sg/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what_or=${encodeURIComponent(
        searchQuery
      )}&results_per_page=${resultsPerPage}`;

      console.log(`Fetching page ${page} from Adzuna...`);

      const response = await fetch(adzunaUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch jobs in page ${page}: ${response.statusText}`
        );
        break; //stop fetching if API is unavailable due to rate limits
      }

      const matchedJobs = await response.json();
      if (!matchedJobs.results || matchedJobs.results.length === 0) {
        console.log(`No more results found on page ${page}. Stopping search.`);
        break;
      }

      allJobs = allJobs.concat(matchedJobs.results); //concat() creates a new array combining both old and new [] e.g. 1st iteration returns [].concat(firstbatch), 2nd iteration returns [firstbatch].concat(secondbatch)
    }

    console.log(`Total jobs fetched: ${allJobs.length}`);

    const rankedJobs = allJobs
      .map((job) => {
        const jobTitle = job.title.toLowerCase();
        const jobDescription = job.description.toLowerCase();

        let matchCount = 0;
        let matchedKeywords = [];

        keywords.forEach((keyword) => {
          let isMatched = false;

          if (jobTitle.includes(keyword)) {
            matchCount += 1; // adjust this to give higher/lesser weight to matches in the title
            matchedKeywords.push(keyword);
            isMatched = true;
          }
          if (jobDescription.includes(keyword) && !isMatched) {
            // Avoid duplicate count
            matchCount += 1;
            matchedKeywords.push(keyword);
          }
        });

        return matchCount > 0 ? { ...job, matchCount, matchedKeywords } : null; // keeps original job data (...job) and adds 2 new properties: matchCount, matchedKeywords
      })
      .filter((job) => job !== null) //remove jobs that do not meet the matchCount
      .sort((a, b) => b.matchCount - a.matchCount); // Sort jobs by matchCount in descending order

    res.status(200).json(rankedJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
