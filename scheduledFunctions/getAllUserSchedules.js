const { getAllSchedules } = require("../controllers/scheduleController");
const User = require("../model/User");

const getAllUserSchedules = async () => {
  const allUsers = await User.find();
  for (i = 0; i < allUsers.length; i++) {
    getAllSchedules(allUsers[i].username, allUsers[i].battery);
    console.log(`loop: ${i}`);
  }
  //getAllSchedules("miep", 37);
  // console.log(allUsers);
};

module.exports = getAllUserSchedules;
