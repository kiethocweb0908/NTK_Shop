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

    res.json(categories);
  } catch (error) {
    console.error("Lỗi khi gọi getCategories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/category/:id
// @desc Get single category
// @access Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Không tìm thấy Category" });

    res.json(category);
  } catch (error) {
    console.error("Lỗi khi gọi getCategory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route POST /api/categories
// @desc Create category
// @access Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // let category = await Category.findOne({ name });

    // if (category) {
    //   return res.status(400).json({ message: "Loại sản phẩm này đã tồn tại!" });
    // }

    // category = new Category({ name });
    // const newCategory = await category.save();
    const category = await Category.create({ name });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }
    console.error("Lỗi khi gọi createCategory ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/categories/:id
// @desc Update category
// @access Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, isActive, metaTitle, metaDescription } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Không tìm thấy loại sản phẩm" });

    const oldName = category.name;

    if (name != undefined) category.name = name;
    if (isActive != undefined) category.isActive = isActive;
    if (metaTitle !== undefined) category.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      category.metaDescription = metaDescription;

    // Cập nhật slug nếu tên thay đổi
    if (name && name !== oldName) {
      category.slug = name
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tên loại sản phẩm đã tồn tại" });
    }
    console.error("Lỗi khi gọi createCategory ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route DELETE /api/categories/:id
// @desc Delete category
// @access Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Không tìm thấy loại sản phẩm!" });

    // CÁCH 1: Xóa hoàn toàn
    // await Category.findByIdAndDelete(req.params.id);

    category.isActive = false;
    await category.save();

    res.json({ message: "Đã xoá loại sản phẩm" });
  } catch (error) {
    console.error("Lỗi khi gọi deleteCategory: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
