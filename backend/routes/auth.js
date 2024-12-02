const { registerUser } = require("../controllers/authController");

const router = require("express").Router();

router.post("/register", registerUser);

module.exports = router;
