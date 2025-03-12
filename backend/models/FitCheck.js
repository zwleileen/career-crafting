const mongoose = require("mongoose");

const FitCheckSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associate responses with a user
  worldVision: { type: String, required: true },
  valuesInsights: { type: mongoose.Schema.Types.Mixed, default: {} },
  careerStatus: { type: mongoose.Schema.Types.Mixed, default: {} },
  summary: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FitCheck", FitCheckSchema);
