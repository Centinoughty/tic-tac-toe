const {
  registerUser,
  loginUser,
  getUser,
} = require("../controllers/authController");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:username", getUser);

module.exports = router;
