import Collection from "../models/Collection.js";

// @route GET /api/collections
// @desc Get all collections
// @access Public
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(collections);
  } catch (error) {
    console.error("Lỗi khi gọi getCollections: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route POST /api/collections
// @desc Create collection
// @access Private/Admin
export const createCollection = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const collection = await Collection.create({ name, description, image });

    res.status(201).json(collection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tên bộ sưu tập đã tồn tại" });
    }
    console.error("Lỗi khi gọi createCollection: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/collections/:id
// @desc Update collection
// @access Private/Admin
export const updateCollection = async (req, res) => {
  try {
    const { name, description, image, isActive, metaTitle, metaDescription } =
      req.body;

    const collection = await Collection.findById(req.params.id);

    if (!collection)
      return res.status(404).json({ message: "Không tìm thấy bộ sưu tập" });

    const oldName = collection.name;

    if (name != undefined) collection.name = name;
    if (description != undefined) collection.description = description;
    if (image != undefined) collection.image = image;
    if (isActive != undefined) collection.isActive = isActive;
    if (metaTitle != undefined) collection.metaTitle = metaTitle;
    if (metaDescription != undefined)
      collection.metaDescription = metaDescription;

    if (name && name !== oldName) {
      collection.slug = name
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

    const updatedCollection = await collection.save();

    res.json(updatedCollection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tên bộ sưu tập đã tồn tại" });
    }
    console.error("Lỗi khi gọi updateConllection ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PATCH /api/collections/:id
// @desc !isActive collection
// @access Private/Admin
export const toggleActiveCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection)
      return res.status(404).json({ message: "Không tìm thấy bộ sưu tập!" });

    collection.isActive = !collection.isActive;
    await collection.save();

    res.json({
      message: `Bộ sưu tập đã được ${
        collection.isActive ? "kích hoạt" : "vô hiệu hóa"
      }`,
      isActive: collection.isActive,
    });
  } catch (error) {
    console.error("Lỗi khi gọi isActiveCollection: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route DELETE /api/collections/:id
// @desc delete collection
// @access Private/Admin
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection)
      return res.status(404).json({ message: "Không tìm thấy bộ sưu tập!" });

    await collection.deleteOne(); // hoặc findByIdAndDelete(req.params.id)

    res.json({ message: "Đã xóa bộ sưu tập thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi deleteCollection:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
