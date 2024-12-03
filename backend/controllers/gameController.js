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

module.exports.joinGame = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Cannot join the game" });
    }

    if (gameId) {
      // Join private match
      const match = await Match.findOne({ gameId, isPrivate: true });
      if (!match) {
        return res.status(404).json({ message: "Cannot find the game" });
      }

      // If match started
      if (match.players.player2) {
        return res.status(400).json({ message: "Game started" });
      }

      // Assign roles
      const [player1Role, player2Role] =
        Math.random() < 0.5 ? ["X", "O"] : ["O", "X"];

      match.players.player1 = { role: player1Role };
      match.players.player2 = { id: userId, role: player2Role };
      match.turn = player1Role === "X" ? match.players.player1.id : userId;
      match.status = "active";
      await match.save();

      return res
        .status(200)
        .json({ message: "Joined match succesfully", gameId });
    } else {
      // Join public match
      waitingList.push(userId);

      // If found a match in waiting list
      if (waitingList.length >= 2) {
        const player1Id = waitingList.shift();
        const player2Id = waitingList.shift();

        // Assign roles
        const [player1Role, player2Role] =
          Math.random() < 0.5 ? ["X", "O"] : ["O", "X"];

        // Create a new match
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

        return res
          .status(201)
          .json({ message: "Match created succesfully", gameId });
      }

      return res.status(200).json({ message: "Waiting for another player" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};
