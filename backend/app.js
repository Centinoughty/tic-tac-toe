const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { connectDb } = require("./config/db");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const lbRoutes = require("./routes/leaderboard");

// Initialization
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", lbRoutes);

// socket.io logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-game", ({ gameId, userId }) => {
    socket.join(gameId);
    console.log(`User ${userId} joined the game ${gameId}`);
  });

  socket.on("game-update", (data) => {
    const { gameId, message, board, turn, status, winner, isDraw } = data;
    io.to(gameId).emit("game-update", {
      message,
      board,
      turn,
      status,
      winner,
      isDraw,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

connectDb();
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = io;
