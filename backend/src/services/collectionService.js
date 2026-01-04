import Collection from "../models/Collection.js";
import Product from "../models/Product.js";
import { uploadImage } from "../utils/uploadImage.js";
import cloudinary from "../config/cloudinary.config.js";

// helper func
const findCollectionById = async (collectionId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new Error("Lỗi! không tìm thấy bộ sưu tập từ ID");
  return collection;
};

const generateSlug = (field) => {
  return field
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

//======================================

export const getAllCollections = async (page, limit, status, search, sort) => {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const matchStage = {};

  // Lọc
  if (status && status !== "all") {
    if (status === "published") matchStage.isActive = true;
    if (status === "hidden") matchStage.isActive = false;
  }

  // sắp xếp
  let sortStage = {};
  switch (sort) {
    case "nameAsc":
      sortStage = { name: 1 };
      break;
    case "nameDesc":
      sortStage = { name: -1 };
      break;
    case "oldest":
      sortStage = { createdAt: 1 };
      break;
    case "newest": // "newest"
      sortStage = { createdAt: -1 };
      break;
    case "productsAsc":
      sortStage = { totalProducts: 1 };
      break;
    case "productsDesc":
      sortStage = { totalProducts: -1 };
      break;

    default:
      break;
  }

  // search
  if (search && search !== "") {
    matchStage.$or = [
      { _id: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  // truy vấn
  const result = await Collection.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "products", // tên collection (plural)
        localField: "_id",
        foreignField: "productCollection",
        as: "products",
      },
    },

    {
      $addFields: {
        totalProducts: { $size: "$products" },
      },
    },

    {
      $project: {
        products: 0,
      },
    },

    { $sort: sortStage },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNumber }],
        metadata: [{ $count: "totalCollections" }],
      },
    },
  ]);

  const collections = result[0].data;
  const totalCollections = result[0].metadata[0]?.totalCollections || 0;
  const totalPages = Math.ceil(totalCollections / limitNumber);

  return {
    collections,
    pagination: {
      totalCollections,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
    },
  };
};

export const details = async (collectionId) => {
  const collection = await findCollectionById(collectionId);

  return collection;
};

export const create = async (data, file) => {
  if (!data.name) throw new Error("Lỗi! thiếu tên bộ sưu tập");
  if (!data.description) throw new Error("Lỗi! thiếu mô tả bộ sưu tập");
  if (!file) throw new Error("Lỗi! thiếu ảnh bộ sưu tập");

  const exists = await Collection.findOne({ name: data.name });
  if (exists) throw new Error("Bộ sưu tập đã tồn tại");

  const result = await uploadImage(file.buffer);

  const collection = await Collection.create({
    name: data.name,
    description: data.description,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  return collection;
};

export const edit = async (collectionId, data, file) => {
  const collection = await findCollectionById(collectionId);

  collection.name = data.name;
  collection.description = data.description;
  collection.slug = generateSlug(data.name);

  const hasNewImage = !!file;

  if (hasNewImage && collection.image?.publicId) {
    await cloudinary.uploader.destroy(collection.image.publicId);
  }

  if (hasNewImage) {
    const result = await uploadImage(file.buffer);

    collection.image = {
      url: result.secure_url,
      publicId: result.public_id,
      altText: `Image ${collection.name}`,
    };
  }

  await collection.validate();
  await collection.save();

  return collection;
};

export const remove = async (collectionId) => {
  const collection = await findCollectionById(collectionId);

  await Product.updateMany(
    { productCollection: collectionId },
    { $set: { productCollection: null } }
  );

  const deletedCollection = await Collection.findByIdAndDelete(collectionId);

  if (collection.image?.publicId) {
    await cloudinary.uploader.destroy(collection.image.publicId);
  }

  return deletedCollection;
};

export const toggleActive = async (colelctionId) => {
  const collection = await findCollectionById(colelctionId);

  if (collection.isActive) {
    await Product.updateMany(
      { productCollection: collection._id, isPublished: true },
      {
        $set: {
          isPublished: false,
          isFeatured: false,
        },
      }
    );
    collection.isActive = false;
  } else {
    collection.isActive = true;
  }

  await collection.validate();
  await collection.save();

  return collection;
};
