import Collection from "../models/Collection.js";

// @route GET /api/collections
// @desc Get all collections
// @access Public
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json({
      message: "Lấy bộ sưu tập thành công!",
      collections,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCollections: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
