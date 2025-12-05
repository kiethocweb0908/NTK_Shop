import express, { Router } from "express";
import multer from "multer";
import {
  uploadImage,
  uploadMultipleImages,
  deleteImages,
} from "../controllers/uploadController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
const router = express.Router();

//Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB mỗi file
    files: 60, // Tối đa 60 files (6 variants × 10 ảnh)
    fieldSize: 100 * 1024 * 1024, // 100MB total field size
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận hình ảnh
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Định dạng ${file.mimetype} không được hỗ trợ`), false);
    }
  },
});

router.post("/", upload.single("image"), protect, admin, uploadImage);

// upload multiple images
router.post(
  "/multiple",
  upload.array("images", 60),
  protect,
  admin,
  uploadMultipleImages
);

// delete images
router.delete("/", protect, admin, deleteImages);

export default router;
