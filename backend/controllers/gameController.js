const User = require("../models/userModel");
const Match = require("../models/matchModel");
const { v4: uuidv4 } = require("uuid");
const { checkWin, isBoardFull } = require("../util/gameUtil");

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
      if (match.status === "active") {
        return res.status(400).json({ message: "Game started" });
      }

      // Assign roles
      const [player1Role, player2Role] =
        Math.random() < 0.5 ? ["X", "O"] : ["O", "X"];

      match.players.player1.role = player1Role;
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

module.exports.makeTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;
    const { position } = req.body;

    // TODO
    // 1. Validate input

    // Check for game
    const game = await Match.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ message: "Cannot find the game" });
    }

    // Check if player part of game
    if (
      !(
        game.players.player1.id.equals(userId) ||
        game.players.player2.id.equals(userId)
      )
    ) {
      return res.status(404).json({ message: "User not part of the game" });
    }

    // Check game status
    if (game.status !== "active") {
      return res.status(400).json({ message: "Game is not active" });
    }

    // Check if it is users turn
    if (!game.turn.equals(userId)) {
      return res.status(403).json({ message: "Wait. not yout turn" });
    }

    // Check if position is empty
    if (game.board[position] !== "") {
      return res.status(400).json({ message: "Position already occupied" });
    }

    // Find the player role
    const playerRole = game.players.player1.id.equals(userId)
      ? game.players.player1.role
      : game.players.player2.role;

    // Update board
    game.board[position] = playerRole;

    if (checkWin(game.board, playerRole)) {
      // If a player wins the game
      game.status = "completed";
      game.winner = { id: userId, role: playerRole };

      // Update the stats for players
      const winner = await User.findById(userId);
      const loserId = game.players.player1.id.equals(userId)
        ? game.players.player2.id
        : game.players.player1.id;
      const loser = await User.findById(loserId);

      if (winner) {
        winner.matches.push(game._id);
        winner.matchDelta.noOfMatches++;
        winner.matchDelta.noOfWins++;
        await winner.save();
      }

      if (loser) {
        loser.matches.push(game._id);
        loser.matchDelta.noOfMatches++;
        loser.matchDelta.noOfLoses++;
        await loser.save();
      }
    } else if (isBoardFull(game.board)) {
      // If the game ends in draw
      game.status = "completed";
      game.isDraw = true;

      // Update the stats for players
      const player1 = await User.findById(game.players.player1.id);
      const player2 = await User.findById(game.players.player2.id);

      if (player1) {
        player1.matches.push(game._id);
        player1.matchDelta.noOfMatches++;
        player1.matchDelta.noOfDraw++;
        await player1.save();
      }

      if (player2) {
        player2.matches.push(game._id);
        player2.matchDelta.noOfMatches++;
        player2.matchDelta.noOfDraw++;
        await player2.save();
      }
    } else {
      // Switch the turn
      game.turn = game.players.player1.id.equals(userId)
        ? game.players.player2.id
        : game.players.player1.id;
    }

    await game.save();

    res.status(200).json({
      message: "Move succesful",
      board: game.board,
      status: game.status,
      winner: game.winner,
      isDraw: game.isDraw,
      turn: game.turn,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error)
  }
};
