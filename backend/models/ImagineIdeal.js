const mongoose = require("mongoose");

const ImagineIdealSchema = new mongoose.Schema({
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Value",
    default: null,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  worldVision: { type: String, required: true },
  valuesInsights: { type: mongoose.Schema.Types.Mixed, default: {} },
  careerPaths: { type: mongoose.Schema.Types.Mixed, default: {} },
  dallEPrompt: { type: Object, default: {} },
  dallEImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ImagineIdeal", ImagineIdealSchema);
