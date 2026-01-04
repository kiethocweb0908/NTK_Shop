import * as collectionService from "../../services/collectionService.js";

// get all
export const getAllCollectionsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sort = "newest" } = req.query;

    const { collections, pagination } =
      await collectionService.getAllCollections(
        page,
        limit,
        status,
        search,
        sort
      );

    res.json({
      message: "Lấy bộ sưu tập thành công!",
      collections,
      pagination,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllCollectionsAdmin:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// get details
export const getCollectionDetailsAdmin = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await collectionService.details(collectionId);

    res.json({
      message: "Lấy chi tiết thành công!",
      collection,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCollectionDetailsAdmin:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// create
export const addCollection = async (req, res) => {
  try {
    const data = req.body;
    const file = req.files.image[0];

    const collection = await collectionService.create(data, file);

    res.json({
      message: "Tạo bộ sưu tập thành công!",
      collection,
    });
  } catch (error) {}
};

// edit
export const editCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const data = req.body;
    const file = req.files.image?.[0];

    const collection = await collectionService.edit(collectionId, data, file);

    res.json({
      message: "Chỉnh sửa bộ sưu tập thành công!",
      collection,
    });
  } catch (error) {
    console.error("Lỗi khi gọi editCollection:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// delete
export const deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const deletedCollection = await collectionService.remove(collectionId);

    res.json({
      message: `Đã xoá bộ sưu tập ${deletedCollection.name}`,
      collection: deletedCollection,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deleteCollection:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// toggle isActive
export const toggleActiveCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await collectionService.toggleActive(collectionId);

    res.json({
      message: `${collection.name} đã ${
        collection.isActive ? "được kích hoạt" : "bị ẩn"
      }`,
      collection,
    });
  } catch (error) {
    console.error("Lỗi khi gọi toggleActiveCollection:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
