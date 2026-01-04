import Category from "../models/Category.js";

// @route GET /api/categories
// @desc Get all categories
// @access Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("_id name")
      .sort({
        name: -1,
      });

    res.json({
      message: "Lấy danh mục thành công!",
      categories,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCategories:", error);
    res.status(500).json({ message: "Server error" });
  }
};
