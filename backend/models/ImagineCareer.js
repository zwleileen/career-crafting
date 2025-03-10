const mongoose = require("mongoose");

const ImagineCareerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobDetails: { type: String, required: true },
  jobNarrative: { type: String, required: true },
  dallEPrompt: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      "A morning in the job": "",
      "An afternoon in the job": "",
      "Impact of the work": "",
    },
  },
  dallEImages: {
    morningInJob: {
      url: { type: String, default: "" },
      prompt: { type: String, default: "" },
    },
    afternoonInJob: {
      url: { type: String, default: "" },
      prompt: { type: String, default: "" },
    },
    impact: {
      url: { type: String, default: "" },
      prompt: { type: String, default: "" },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ImagineCareer", ImagineCareerSchema);
