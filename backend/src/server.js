import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// const cors = require("cors");

import { connectDB } from "./config/db.js";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 5001;

//Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

app.get("/", (req, res) => {
  res.send("WELCOME TO NTK API!");
});
