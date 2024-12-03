const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    players: {
      player1: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        role: {
          type: String,
          enum: ["X", "O"],
          required: false,
        },
      },
      player1: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        role: {
          type: String,
          enum: ["X", "O"],
          required: false,
        },
      },
    },
    board: {
      type: [String],
      default: ["", "", "", "", "", "", "", "", ""],
      validate: [
        (array) => array.length === 9,
        "Board must have exactly 9 cells",
      ],
    },
    turn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },
    winner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      role: {
        type: String,
        enum: ["X", "O", ""],
        default: "",
      },
    },
    isDraw: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("matches", MatchSchema);
