import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Không có file hình ảnh" });

    // ✅ THÊM: Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Chỉ chấp nhận ảnh JPEG, PNG, WebP",
      });
    }

    // ✅ THÊM: Validate file size (max 5MB)
    const maxSize = 15 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: "Ảnh không được vượt quá 15MB",
      });
    }

    // Function to handle the stream upload to Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        // Use streamifier to convert file buffer to a stream
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Respond with the uploaded image URL
    res.json({
      publicId: result.public_id,
      imageURL: result.secure_url,
    });
  } catch (error) {
    console.error("Lỗi khi upload image: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
