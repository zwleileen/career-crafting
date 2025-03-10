const mongoose = require("mongoose");

const valueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  answers: { type: Object, required: true }, //only accepts object e.g. {name:"amy", age:24}
  topValues: { type: [String], default: [] }, //only accepts an array of strings e.g. ["universalism", "benevolence"]
  topStrengths: { type: [String], default: [] },
  valuesInsights: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Value", valueSchema);
