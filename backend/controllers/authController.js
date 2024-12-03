const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const JWT_TOKEN = process.env.JWT_TOKEN;

module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // If username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // If email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // TODO:
    // 1. Add validation for username, email, password

    // Create user
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "Account created" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // TODO
    // 1. Add validation to both loginId and password

    // Either username or email
    const user = await User.findOne({
      $or: [{ username: loginId }, { email: loginId }],
    });

    // If user does not exist
    if (!user) {
      return res.status(404).json({ message: "Cannot find user" });
    }

    // If password is incorrect
    if (!(await user.isMatchPassword(password))) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Build a token
    const token = jwt.sign({ _id: user._id }, JWT_TOKEN);

    res.status(200).json({ message: "User logged in", token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};

module.exports.getUser = async (req, res) => {
  const { username } = req.params;

  // TODO
  // 1. Display protected contents

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Cannot find user" });
  }

  return res.status(200).json({
    message: "User fetched succesfully",
    user: { username, avatar: user.avatar, matchDelta: user.matchDelta },
  });
};
