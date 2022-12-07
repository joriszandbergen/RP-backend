const ScheduleLog = require("../model/ScheduleLog");
const User = require("../model/User");
const CarbonSavings = require("../model/CarbonSavings");
const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const sub = require("date-fns/sub");
const subDays = require("date-fns/subDays");
const axios = require("axios");

const getYesterdayCarbonSavings = async (req, res) => {
  try {
    const result = await CarbonSavings.find({
      username: req.params.user,
      startDate: {
        $gte: startOfDay(sub(new Date(), { days: 1, hours: 3 })),
        $lte: endOfDay(sub(new Date(), { days: 1, hours: 3 })),
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

const getAllCarbonSavings = async () => {
  const allUsers = await User.find();
  for (i = 0; i < allUsers.length; i++) {
    await getCarbonSavings(allUsers[i].username);
    console.log(`loop: ${i}`);
  }
};

const getCarbonSavings = async (username) => {
  let defaultCarbon = 0;
  let totalSavings = 0;
  let totalDuration = [];
  let carbonData;
  let startDate;

  const dailyScheduleLogs = await ScheduleLog.find({
    username: username,
    start: {
      $gte: startOfDay(subDays(new Date(), 1)),
      $lte: endOfDay(subDays(new Date(), 1)),
    },
  });

  console.log(dailyScheduleLogs);

  const dailyCarbonLogs = [];

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
    let totalCharged = 0;

    totalDuration.push(dailyScheduleLogs[i].duration);

    const result = await getCarbonSensorData(
      dailyScheduleLogs[i].start,
      dailyScheduleLogs[i].duration
    );

    if (dailyScheduleLogs[i].distance > 0) {
      if (result.find((el) => el)) {
        defaultCarbon =
          defaultCarbon +
          ((dailyScheduleLogs[i].distance * 0.16) / 1000) *
            result.find((el) => el);
        console.log(result.find((el) => el));
      } else {
        defaultCarbon = ((dailyScheduleLogs[i].distance * 0.16) / 1000) * 200;
      }
    }

    for (let x = 0; x < result.length; x++) {
      if (result[x]) {
        totalSavings =
          totalSavings + (dailyScheduleLogs[i].values[x] / 12) * result[x];
      } else {
        totalSavings =
          totalSavings + (dailyScheduleLogs[i].values[x] / 12) * 200;
      }
    }

    // console.log(dailyScheduleLogs[i].distance);
    // console.log(username);
    // console.log(`total v2g carbon: ${totalSavings} kg`);
    // console.log(`total charged: ${totalCharged} MWh`);
    // console.log(`total default carbon: ${defaultCarbon} kg`);
  }

  const data = await CarbonSavings.create({
    username: username,
    v2gCarbon: totalSavings,
    defaultCarbon: defaultCarbon,
    startDate: endOfDay(sub(new Date(), { days: 1, hours: 3 })),
    totalDuration: totalDuration,
    carbonEmissionData: carbonData,
  });
  return totalSavings;
};

const getCarbonSensorData = async (startTime, duration) => {
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
      sensor: "ea1.2022-03.nl.seita.flexmeasures:fm1.27",
      start: startTime,
      duration: duration,
      resolution: "PT5M",
      unit: "kg/MWh",
    },
  });

  console.log(response.data);
  return response.data.values;
};

module.exports = { getAllCarbonSavings, getYesterdayCarbonSavings };
