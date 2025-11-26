import express, { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
const router = express.Router();

//Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), protect, admin, uploadImage);

export default router;
