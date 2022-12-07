const ChargeLog = require("../model/ChargeLog");
const ScheduleLog = require("../model/ScheduleLog");

const endOfDay = require("date-fns/endOfDay");
const startOfDay = require("date-fns/startOfDay");
const intervalToDuration = require("date-fns/intervalToDuration");
const formatISODuration = require("date-fns/formatISODuration");
const subDays = require("date-fns/subDays");
const axios = require("axios");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const roundToNearest5 = (date = new Date()) => {
  const minutes = 5;
  const ms = 1000 * 60 * minutes;
  // 👇️ replace Math.round with Math.ceil to always round UP
  return new Date(Math.round(date.getTime() / ms) * ms);
};

const getAllSchedules = async (username, battery) => {
  const dailyChargeLogs = await ChargeLog.find({
    username: username,
    date: {
      $gte: startOfDay(subDays(new Date(), 1)),
      $lte: endOfDay(subDays(new Date(), 1)),
    },
  }).sort({ date: 1 });

  const latestChargeLog = await ChargeLog.find({ username: username })
    .sort({ date: -1 })
    .limit(1);

  let timeSpans = [];

  let loopLength;
  if (!dailyChargeLogs[0]) {
    loopLength = 0;
  } else if (dailyChargeLogs.length === 2 && dailyChargeLogs[0].isPluggedIn) {
    loopLength = 1;
  } else if (dailyChargeLogs.length === 2) {
    loopLength = 2;
  } else if (dailyChargeLogs[0].isPluggedIn) {
    loopLength = Math.ceil(dailyChargeLogs.length / 2);
  } else {
    loopLength = Math.floor(dailyChargeLogs.length / 2 + 1);
  }

  console.log(`loop length: ${loopLength}`);

  if (!latestChargeLog[0]) {
    timeSpans = [
      {
        start: startOfDay(subDays(new Date(), 1)),
        end: endOfDay(subDays(new Date(), 1)),
        distance: 0,
      },
    ];
  } else if (dailyChargeLogs.length === 0) {
    if (latestChargeLog.isPluggedIn) {
      timeSpans = [
        {
          start: startOfDay(subDays(new Date(), 1)),
          end: endOfDay(subDays(new Date(), 1)),
          distance: 0,
        },
      ];
    }
  } else {
    for (let i = 0; i < loopLength; i++) {
      let start = parseInt(i * 2 - 1);
      let end = parseInt(i * 2);
      // when the first chargelog show the car is plugged in,
      // start the timespan from 00:00
      if (!dailyChargeLogs[0].isPluggedIn) {
        if (i === 0) {
          timeSpans[i] = {
            start: startOfDay(subDays(new Date(), 1)),
            end: dailyChargeLogs[i].date,
            distance: 0,
          };
        } else if (dailyChargeLogs[start] === dailyChargeLogs.slice(-1)[0]) {
          timeSpans[i] = {
            start: dailyChargeLogs[start].date,
            end: endOfDay(subDays(new Date(), 1)),
            distance: dailyChargeLogs[start].distanceDriven,
          };
        } else {
          timeSpans[i] = {
            start: dailyChargeLogs[start].date,
            end: dailyChargeLogs[end].date,
            distance: dailyChargeLogs[start].distanceDriven,
          };
        }
      }
      // when the first chargelog show the car is NOT plugged in,
      // start the timespan from the time in the first chargelog
      else {
        if (i === 0 && dailyChargeLogs.length === 1) {
          timeSpans[i] = {
            start: dailyChargeLogs[i].date,
            end: endOfDay(subDays(new Date(), 1)),
            distance: dailyChargeLogs[i].distanceDriven,
          };
        } else if (i === 0) {
          timeSpans[i] = {
            start: dailyChargeLogs[i].date,
            end: dailyChargeLogs[i + 1].date,
            distance: dailyChargeLogs[i].distanceDriven,
          };
          console.log(99);
        } else if (
          dailyChargeLogs[end] === dailyChargeLogs.slice(-1)[0] &&
          dailyChargeLogs.slice(-1)[0].isPluggedIn
        ) {
          timeSpans[i] = {
            start: dailyChargeLogs[i * 2].date,
            end: endOfDay(subDays(new Date(), 1)),
            distance: dailyChargeLogs[i * 2].distanceDriven,
          };
          console.log(108);
        } else {
          timeSpans[i] = {
            start: dailyChargeLogs[i * 2].date,
            end: dailyChargeLogs[i * 2 + 1].date,
            distance: dailyChargeLogs[i * 2].distanceDriven,
          };
          console.log(115);
        }
      }
    }
  }
  //console.log(dailyChargeLogs);
  console.log(username);
  console.log(timeSpans);

  if (!timeSpans.start) {
    timeSpans.forEach((element) => {
      const schedule = collectSchedule(
        battery,
        element.start,
        element.end,
        element.distance,
        username
      );
    });
  }
};

const collectSchedule = async (id, startTime, endTime, distance, username) => {
  const AUTH_URL = "https://flexmeasures.seita.nl/api/requestAuthToken";
  const DATA_URL = `https://flexmeasures.seita.nl/api/v3_0/sensors/${id}/schedules/trigger`;
  const SCHEDULE_URL = `https://flexmeasures.seita.nl/api/v3_0/sensors/${id}/schedules`;

  const credentials = {
    email: "j.m.zandbergen@student.tue.nl",
    password: "PiemPmPom-234",
  };

  const authResponse = await axios({
    method: "post",
    url: AUTH_URL,
    data: credentials,
  });

  console.log(username);

  const duration = formatISODuration(
    intervalToDuration({
      start: roundToNearest5(startTime),
      end: roundToNearest5(endTime),
    })
  );

  let socAtStart = 32 - distance * 0.16;
  console.log(`soc at start : ${socAtStart}`);
  if (socAtStart < 1) {
    socAtStart = 0.5;
  }
  if (!socAtStart) {
    socAtStart = 32;
  }

  if (`${duration}` !== "P0Y0M0DT0H0M0S") {
    const response = await axios({
      method: "post",
      url: DATA_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: authResponse.data.auth_token,
      },
      data: {
        start: roundToNearest5(startTime), //formatISO(roundToNearest5(startTime))
        "soc-at-start": socAtStart,
        "soc-unit": "kWh",
        "soc-min": 8,
        "soc-max": 32,
        "roundtrip-efficiency": 0.98,
        "soc-targets": [
          {
            value: 32,
            datetime: roundToNearest5(endTime),
          },
        ],
      },
    });

    console.log(response.data);
    console.log("waiting 10 minutes...");
    console.log(duration);

    await delay(10 * 60 * 1000);

    try {
      const schedule = await axios({
        method: "get",
        url: `${SCHEDULE_URL}/${response.data.schedule}`,
        params: {
          duration: duration,
        },
        headers: { Authorization: authResponse.data.auth_token },
      });
      const data = await ScheduleLog.create({
        username: username,
        unit: schedule.data.unit,
        start: schedule.data.start,
        duration: schedule.data.duration,
        values: schedule.data.values,
        triggerDate: new Date().setTime(Date.now() + 60 * 60 * 1000),
        distance: distance,
      });
      console.log(`Schedule of: ${data.username} is complete!`);
      return schedule.data;
    } catch (err) {
      console.log(err);
    } finally {
    }
  }
};

module.exports = { getAllSchedules };
