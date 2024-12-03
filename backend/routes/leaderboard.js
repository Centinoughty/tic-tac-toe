const { getLeaderboard } = require("../controllers/lbController");

const router = require("express").Router();

router.get("/", getLeaderboard);

module.exports = router;
