// const cors = require("cors");
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { connectDB } from "./config/db.js";
import {
  startCancelExpiredOrdersCron,
  deliveredCron,
  completedOrderCron,
} from "./cron/ordersCron.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

const PORT = process.env.PORT || 9000;

//Connect to MongoDB
connectDB().then(() => {
  startCancelExpiredOrdersCron();
  deliveredCron();
  completedOrderCron();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

app.get("/", (req, res) => {
  res.send("WELCOME TO NTK API!");
});

// API Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File quá lớn. Tối đa 5MB mỗi file",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Quá nhiều files. Tối đa 60 files mỗi lần upload",
      });
    }
  }

  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
