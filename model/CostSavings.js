const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const costSavingsSchema = new Schema({
  username: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  startDate: { type: Date },
  totalDuration: [{ type: String }],
  v2gCosts: { type: Number },
  defaultCosts: { type: Number },
});

module.exports = mongoose.model("CostSavings", costSavingsSchema);
