// controllers/uploadController.js
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config.js";

// Helper: Tạo folder name từ timestamp
const generateFolderName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `products/${year}/${month}`;
};

// Helper: Upload single image với optimization
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: generateFolderName(),
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { format: "webp" }, // Chuyển sang webp
        ],
        resource_type: "image",
        timeout: 60000, // 1 phút cho mỗi ảnh
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Upload multiple images với batch processing - TỐI ƯU LẠI
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có file hình ảnh nào được tải lên",
      });
    }

    // console.log(`📤 Nhận ${req.files.length} ảnh để upload`);

    // ✅ Validate files
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB mỗi ảnh

    // Kiểm tra tổng số ảnh
    if (req.files.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Tối đa 60 ảnh mỗi lần upload",
      });
    }

    // Kiểm tra tổng kích thước
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 60 * 1024 * 1024) {
      // Cloudinary free limit: 60MB
      return res.status(400).json({
        success: false,
        message: `Tổng kích thước ảnh vượt quá 60MB. Hiện tại: ${(
          totalSize /
          (1024 * 1024)
        ).toFixed(2)}MB`,
      });
    }

    // Filter valid files
    const validFiles = [];
    const invalidFiles = [];

    req.files.forEach((file) => {
      if (allowedMimes.includes(file.mimetype) && file.size <= maxSize) {
        validFiles.push(file);
      } else {
        invalidFiles.push({
          name: file.originalname,
          size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
          mimetype: file.mimetype,
          reason: !allowedMimes.includes(file.mimetype)
            ? "Định dạng không hợp lệ"
            : `Kích thước vượt quá 5MB`,
        });
      }
    });

    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có file hợp lệ",
        invalidFiles,
      });
    }

    // console.log(
    //   `✅ Có ${validFiles.length} ảnh hợp lệ, ${invalidFiles.length} ảnh không hợp lệ`
    // );

    // ✅ Upload tuần tự để dễ kiểm soát
    const uploadedImages = [];
    const failedUploads = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      // console.log(
      //   `🔄 Đang upload ảnh ${i + 1}/${validFiles.length}: ${file.originalname}`
      // );

      try {
        const result = await uploadToCloudinary(file.buffer);

        uploadedImages.push({
          originalName: file.originalname,
          publicId: result.public_id,
          imageURL: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          folder: result.folder,
        });

        // console.log(`✅ Upload thành công: ${file.originalname}`);
      } catch (error) {
        // console.error(`❌ Lỗi upload ${file.originalname}:`, error.message);
        failedUploads.push({
          originalName: file.originalname,
          error: error.message,
        });

        // Dừng nếu có quá nhiều lỗi
        if (failedUploads.length > 5) {
          return res.status(500).json({
            success: false,
            message: "Quá nhiều lỗi upload, vui lòng thử lại",
            uploadedImages,
            failedUploads,
          });
        }
      }
    }

    // ✅ Format response
    res.json({
      success: true,
      message: `Đã upload thành công ${uploadedImages.length}/${validFiles.length} ảnh`,
      stats: {
        totalReceived: req.files.length,
        validFiles: validFiles.length,
        uploaded: uploadedImages.length,
        failed: failedUploads.length,
        invalidFiles: invalidFiles.length,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      },
      images: uploadedImages.map((img) => ({
        imageURL: img.imageURL, // Đảm bảo có trường này
        publicId: img.publicId, // Đảm bảo có trường này
        altText: img.altText || "", // Thêm altText nếu cần
        // Các trường khác nếu cần
        format: img.format,
        // width: img.width,
        // height: img.height,
      })),
      failedUploads: failedUploads.length > 0 ? failedUploads : undefined,
      invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined,
    });
  } catch (error) {
    console.error("❌ Lỗi khi upload multiple images: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi upload ảnh",
      error: error.message,
    });
  }
};

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file hình ảnh",
      });
    }

    // Validate
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ chấp nhận ảnh JPEG, PNG, WebP",
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "Ảnh không được vượt quá 5MB",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      publicId: result.public_id,
      imageURL: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Lỗi khi upload image: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Delete images from Cloudinary
export const deleteImages = async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có publicIds để xoá",
      });
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      type: "upload",
      resource_type: "image",
    });

    res.json({
      success: true,
      message: `Đã xoá ${Object.keys(result.deleted).length} ảnh`,
      result: result.deleted,
    });
  } catch (error) {
    console.error("Lỗi khi xoá ảnh: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xoá ảnh",
      error: error.message,
    });
  }
};
