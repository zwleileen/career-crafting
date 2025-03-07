const mongoose = require("mongoose");

const JobKeywordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: true },
  jobDetails: { type: String, required: true },
  industryKeywords: { type: [String], required: true },
  skillsKeywords: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobKeyword", JobKeywordSchema);
