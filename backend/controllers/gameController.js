const User = require("../models/userModel");
const Match = require("../models/matchModel");
const { v4: uuidv4 } = require("uuid");

let waitingList = [];

module.exports.createGame = async (req, res) => {
  try {
    const { isPrivate } = req.body;
    const userId = req.user._id;

    // If user exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Cannot create a game" });
    }

    if (isPrivate) {
      // If game is private
      const gameId = uuidv4();
      const newMatch = new Match({
        gameId,
        players: { player1: { id: userId }, player2: null },
        isPrivate: true,
      });

      await newMatch.save();

      return res.status(201).json({ message: "Created a game", gameId });
    } else {
      // If game is public
      waitingList.push(userId);

      if (waitingList.length >= 2) {
        const player1Id = waitingList.shift();
        const player2Id = waitingList.shift();

        const [player1Role, player2Role] =
          Math.random() < 0.5 ? ["X", "O"] : ["O", "X"];

        const gameId = uuidv4();
        const newMatch = new Match({
          gameId,
          players: {
            player1: { id: player1Id, role: player1Role },
            player2: { id: player2Id, role: player2Role },
          },
          turn: player1Role === "X" ? player1Id : player2Id,
          status: "active",
        });

        await newMatch.save();

        return res.status(201).json({ message: "Created a game", gameId });
      }

      return res.status(200).json({ message: " Waiting for another player" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};
