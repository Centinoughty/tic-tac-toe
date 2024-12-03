const router = require("express").Router();
const { createGame, joinGame } = require("../controllers/gameController");
const auth = require("../middlewares/auth");

router.post("/create", auth, createGame);
router.post("/join", auth, joinGame);

module.exports = router;
