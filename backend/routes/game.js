const router = require("express").Router();
const { createGame } = require("../controllers/gameController");
const auth = require("../middlewares/auth");

router.post("/create", auth, createGame);

module.exports = router;
