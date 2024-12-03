const router = require("express").Router();
const {
  createGame,
  joinGame,
  makeTurn,
} = require("../controllers/gameController");
const auth = require("../middlewares/auth");

router.post("/create", auth, createGame);
router.post("/join", auth, joinGame);
router.put("/:gameId", auth, makeTurn);

module.exports = router;
