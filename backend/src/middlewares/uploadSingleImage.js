// middlewares/uploadSingleImage.js
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    cb(
      allowed.includes(file.mimetype) ? null : new Error("File không hợp lệ"),
      true
    );
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "imageSizeMen", maxCount: 1 },
  { name: "imageSizeWomen", maxCount: 1 },
]);
