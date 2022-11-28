const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carbonSavingsSchema = new Schema({
  username: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  startDate: { type: Date },
  totalDuration: [{ type: String }],
  v2gCarbon: { type: Number },
  defaultCarbon: { type: Number },
  carbonEmissionData: [{ type: Number }],
});

module.exports = mongoose.model("CarbonSavings", carbonSavingsSchema);
