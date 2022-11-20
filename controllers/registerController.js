const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  console.log(user);
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "Username & password are required." });
  }
  const duplicate = await User.findOne({ username: user }).exec();
  if (duplicate) return res.sendStatus(409);

  try {
    //encrypt the pwd
    const hashedPwd = await bcrypt.hash(pwd, 10);
    //create new user
    const result = await User.create({
      username: user,
      password: hashedPwd,
    });
    console.log(result);
    res.status(201).json({ succes: `new ${user} created succesfully!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
