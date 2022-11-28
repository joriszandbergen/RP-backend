const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planningSchema = new Schema({
  username: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  startDate: { type: Date },
  planningAmount: { type: Number },
});

module.exports = mongoose.model("Planning", planningSchema);
