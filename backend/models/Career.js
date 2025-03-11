const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Associate responses with a user
  worldVision: { type: String, required: true },
  valuesInsights: { type: mongoose.Schema.Types.Mixed, default: {} },
  careerPaths: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Career", careerSchema);
