const ChargeLog = require("../model/ChargeLog");
const Planning = require("../model/Planning");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const sub = require("date-fns/sub");
const axios = require("axios");

const getYesterdayPlannings = async (req, res) => {
  let planningAmount = 0;
  const result = await ChargeLog.find({
    username: req.params.user,
    startDate: {
      $gte: startOfDay(sub(new Date(), { days: 1 })),
      $lte: endOfDay(sub(new Date(), { days: 1 })),
    },
  });

  for (let i = 0; i < result.length; i++) {
    if (result.distanceDriven > 45) {
      planningAmount++;
    }
  }
  res.status(201).json(planningAmount);
};
module.exports = { getYesterdayPlannings };
