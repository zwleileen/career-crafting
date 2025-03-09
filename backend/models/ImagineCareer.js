const mongoose = require("mongoose");

const ImagineCareerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: true },
  jobDetails: { type: String, required: true },
  jobNarrative: { type: String, required: true },
  dallEPrompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ImagineCareer", ImagineCareerSchema);
