const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDb();
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
