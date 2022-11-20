const ChargeLog = require("../model/ChargeLog");
const User = require("../model/User");

const logChargeEvent = async (req, res) => {
  console.log(req.body.isPluggedIn);
  if (!req?.body?.user)
    return res.status(400).json({ message: "Username required" });

  const user = await User.findOne({ username: req.body.user }).exec();
  if (!user)
    return res
      .status(204)
      .json({ message: `No user found with username ${req.body.user}` });

  try {
    const result = await ChargeLog.create({
      isPluggedIn: req.body.isPluggedIn,
      username: req.body.user,
      date: new Date().setTime(Date.now() + 60 * 60 * 1000),
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
  }
};

const getLatestChargeLog = async (req, res) => {
  console.log(req.params);
  if (!req?.params?.user)
    return res.status(400).json({ message: "Username required" });

  const user = await User.findOne({ username: req.params.user }).exec();
  if (!user)
    return res
      .status(204)
      .json({ message: `No user found with username ${req.params.user}` });

  try {
    const result = await ChargeLog.find({ username: req.params.user })
      .sort({ date: -1 })
      .limit(1);
    console.log(result);
    res.status(201).json(result[0].isPluggedIn);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { logChargeEvent, getLatestChargeLog };
