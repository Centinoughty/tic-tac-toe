const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    nameDelta: {
      isPublic: {
        type: Boolean,
        default: false,
      },
    },
    country: {
      type: String,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    matches: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "matches" }],
    },
    matchDelta: {
      noOfMatches: {
        type: Number,
        default: 0,
      },
      noOfWins: {
        type: Number,
        default: 0,
      },
      noOfLoses: {
        type: Number,
        default: 0,
      },
      noOfDraw: {
        type: Number,
        default: 0,
      },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", UserSchema);
