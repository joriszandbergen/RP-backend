const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chargeLogSchema = new Schema({
  isPluggedIn: { type: Boolean, required: true },
  username: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("ChargeLog", chargeLogSchema);
