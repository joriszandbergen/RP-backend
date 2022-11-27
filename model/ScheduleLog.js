const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleLogSchema = new Schema({
  username: { type: String, required: true },
  unit: { type: String, default: "MW" },
  start: { type: Date, required: true },
  duration: { type: String, required: true },
  values: [Number],
  triggerDate: { type: Date, required: true },
  distance: { type: Number },
});

module.exports = mongoose.model("ScheduleLog", scheduleLogSchema);
