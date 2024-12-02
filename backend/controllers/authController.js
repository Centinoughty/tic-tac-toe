const User = require("../models/userModel");

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
    console.log(error)
  }
};
