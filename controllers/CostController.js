const ScheduleLog = require("../model/ScheduleLog");
const User = require("../model/User");
const CostSavings = require("../model/CostSavings");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const sub = require("date-fns/sub");
const axios = require("axios");

const getYesterdaySavings = async (req, res) => {
  try {
    const result = await CostSavings.find({
      username: req.params.user,
      startDate: {
        $gte: startOfDay(sub(new Date(), { days: 1, hours: 2 })),
        $lte: endOfDay(sub(new Date(), { days: 1, hours: 2 })),
      },
    })
      .sort([["date", -1]])
      .limit(1);
    console.log(result);
    if (!result) {
      return res.status(401).json("Savings still need to be calculated!");
    }
    res.status(201).json(result[0]);
  } catch (err) {
    console.log(err);
  }
};

const getAllCostSavings = async () => {
  const allUsers = await User.find();
  for (i = 0; i < allUsers.length; i++) {
    await getCostSavings(allUsers[i].username);
    console.log(`loop: ${i}`);
  }
};

const getCostSavings = async (username) => {
  let totalSavings = 0;
  let totalDuration = [];
  let startDate;

  const dailyScheduleLogs = await ScheduleLog.find({
    username: username,
    start: {
      $gte: startOfDay(subDays(new Date(), 1)),
      $lte: endOfDay(subDays(new Date(), 1)),
    },
  });

  console.log(dailyScheduleLogs);

  const dailyPricingLogs = [];

  //console.log(dailyPricingLogs);

  if (!dailyScheduleLogs) {
    return console.log(`No schedule have been found for user: ${username}`);
  }

  // if (
  //   dailyScheduleLogs.length > 1 &&
  //   dailyScheduleLogs[0].start === dailyScheduleLogs[1].start
  // ) {
  //   return console.log(`No schedule have been found for user: ${username}`);
  // }
  for (let i = 0; i < dailyScheduleLogs.length; i++) {
    totalDuration.push(dailyScheduleLogs[i].duration);

    const result = await getPriceSensorData(
      dailyScheduleLogs[i].start,
      dailyScheduleLogs[i].duration
    );

    for (let x = 0; x < result.length; x++) {
      if (result[x]) {
        totalSavings =
          totalSavings + (dailyScheduleLogs[i].values[x] / 12) * result[x];
      }
    }
  }

  console.log(totalSavings);

  const data = await CostSavings.create({
    username: username,
    v2gCosts: totalSavings,
    startDate: startOfDay(subDays(new Date(), 1)),
    totalDuration: totalDuration,
  });

  console.log(totalSavings);
  return totalSavings;
};

const getPriceSensorData = async (startTime, duration) => {
  const AUTH_URL = "https://flexmeasures.seita.nl/api/requestAuthToken";
  const DATA_URL = "https://flexmeasures.seita.nl/api/v3_0/sensors/data";

  const credentials = {
    email: "j.m.zandbergen@student.tue.nl",
    password: "PiemPmPom-234",
  };

  const authResponse = await axios({
    method: "post",
    url: AUTH_URL,
    data: credentials,
  });

  const response = await axios({
    method: "get",
    url: DATA_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: authResponse.data.auth_token,
    },
    params: {
      sensor: "ea1.2022-03.nl.seita.flexmeasures:fm1.14",
      start: startTime,
      duration: duration,
      resolution: "PT5M",
      unit: "EUR/MWh",
    },
  });

  console.log(response.data.start);
  console.log(response.data.duration);
  return response.data.values;
};

module.exports = { getAllCostSavings, getYesterdaySavings };
