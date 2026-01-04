import * as categoryService from "../../services/categoryService.js";

export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = "newest", search } = req.query;

    const { categories, pagination } = await categoryService.getAll(
      page,
      limit,
      status,
      sort,
      search
    );

    res.json({
      message: "Lấy danh sách danh mục thành công",
      categories,
      pagination,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllCategoriesAdmin:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const getCategoryDetails = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.getDetails(categoryId);

    res.json({
      message: "Lấy chi tiết danh mục thành công!",
      category,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCategoryDetails:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const data = req.body;
    const imageSizeMen = req.files?.imageSizeMen?.[0];
    const imageSizeWomen = req.files?.imageSizeWomen?.[0];

    const createdCategory = await categoryService.create(
      data,
      imageSizeMen,
      imageSizeWomen
    );

    res.status(201).json({
      message: "Tạo danh mục thành công",
      category: createdCategory,
    });
  } catch (error) {
    console.error("Lỗi khi gọi createCategory:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const editCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const data = req.body;
    const imageSizeMen = req.files?.imageSizeMen?.[0];
    const imageSizeWomen = req.files?.imageSizeWomen?.[0];

    const category = await categoryService.edit(
      categoryId,
      data,
      imageSizeMen,
      imageSizeWomen
    );

    res.json({
      message: "Chỉnh sửa danh mục thành công!",
      category,
    });
  } catch (error) {
    console.error("Lỗi khi gọi editCategory:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deletedCategory = await categoryService.remove(categoryId);

    res.json({
      message: "Xoá danh mục thành công!",
      category: deletedCategory,
    });
  } catch (error) {
    console.error("Lỗi khi gọi editCategory:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const toggleActiveCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.toggleActive(categoryId);

    res.json({
      message: `Danh mục ${category.name} đã ${
        category.isActive ? "được kích hoạt" : "bị ẩn"
      }`,
      category,
    });
  } catch (error) {
    console.error("Lỗi khi gọi toggleActiveCategory:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
