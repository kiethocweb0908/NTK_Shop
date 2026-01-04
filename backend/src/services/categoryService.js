import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { uploadImage } from "../utils/uploadImage.js";
import cloudinary from "../config/cloudinary.config.js";

// helper func

const findCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Lỗi! không tìm thấy danh mục từ ID");
  return category;
};

//=====================

// get all
export const getAll = async (page, limit, status, sort, search) => {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const matchStage = {};

  // Lọc theo trạng thái đơn hàng
  if (status === "isInactive") {
    matchStage.isActive = false;
  } else if (status === "isActive") {
    matchStage.isActive = true;
  }

  // search
  if (search && search !== "") {
    matchStage.$or = [
      { _id: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  // sort
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

  // truy vấn
  const result = await Category.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
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
        metadata: [{ $count: "totalCategories" }],
      },
    },
  ]);

  const categories = result[0].data;
  const totalCategories = result[0].metadata[0]?.totalCategories || 0;
  const totalPages = Math.ceil(totalCategories / limitNumber);

  return {
    categories,
    pagination: {
      totalCategories,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
    },
  };
};

// get details
export const getDetails = async (categoryId) => {
  const category = await findCategoryById(categoryId);
  return category;
};

// creat
export const create = async (data, imageSizeMen, imageSizeWomen) => {
  if (!data.name) throw new Error("Lỗi! thiếu tên danh mục");
  if (!data.description) throw new Error("Lỗi! thiếu mô tả danh mục");
  if (!imageSizeMen && !imageSizeWomen)
    throw new Error("Lỗi! thiếu ảnh danh mục");

  const exists = await Category.findOne({ name: data.name });
  if (exists) throw new Error("Tên danh mục đã tồn tại");

  const category = {
    name: data.name,
    description: data.description,
  };

  const uploadedPublicIds = [];
  try {
    if (imageSizeMen) {
      const men = await uploadImage(imageSizeMen.buffer, "category");
      uploadedPublicIds.push(men.public_id);
      category.imageSizeMen = {
        url: men.secure_url,
        publicId: men.public_id,
        altText: `Men ${data.name}`,
      };
    }

    if (imageSizeWomen) {
      const women = await uploadImage(imageSizeWomen.buffer, "category");
      uploadedPublicIds.push(women.public_id);
      category.imageSizeWomen = {
        url: women.secure_url,
        publicId: women.public_id,
        altText: `Women ${data.name}`,
      };
    }

    const createdCategory = await Category.create(category);

    return createdCategory;
  } catch (error) {
    if (uploadedPublicIds.length > 0) {
      await cloudinary.api.delete_resources(uploadedPublicIds);
    }
    throw error;
  }
};

// edit
export const edit = async (categoryId, data, imageSizeMen, imageSizeWomen) => {
  const category = await findCategoryById(categoryId);

  category.name = data.name;
  category.description = data.description;

  const hasNewImageMen = !!imageSizeMen;
  const hasNewImageWomen = !!imageSizeWomen;

  if (hasNewImageMen && category.imageSizeMen.publicId) {
    await cloudinary.uploader.destroy(category.imageSizeMen.publicId);
  }

  if (hasNewImageWomen && category.imageSizeWomen.publicId) {
    await cloudinary.uploader.destroy(category.imageSizeWomen.publicId);
  }

  if (hasNewImageMen) {
    const result = await uploadImage(imageSizeMen.buffer, "category");

    category.imageSizeMen = {
      url: result.secure_url,
      publicId: result.public_id,
      altText: `Image ${category.name} Men`,
    };
  }

  if (hasNewImageWomen) {
    const result = await uploadImage(imageSizeWomen.buffer, "category");

    category.imageSizeWomen = {
      url: result.secure_url,
      publicId: result.public_id,
      altText: `Image ${category.name} Women`,
    };
  }

  await category.validate();
  await category.save();

  return category;
};

// remove
export const remove = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  await Product.updateMany(
    { category: categoryId },
    { $set: { category: null } }
  );

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (category.imageSizeMen?.publicId) {
    await cloudinary.uploader.destroy(category.imageSizeMen?.publicId);
  }
  if (category.imageSizeWomen?.publicId) {
    await cloudinary.uploader.destroy(category.imageSizeWomen?.publicId);
  }

  return deletedCategory;
};

// toggle active
export const toggleActive = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (category.isActive) {
    await Product.updateMany(
      { category: category._id, isPublished: true },
      {
        $set: {
          isPublished: false,
          isFeatured: false,
        },
      }
    );
    category.isActive = false;
  } else {
    category.isActive = true;
  }

  await category.validate();
  await category.save();

  return category;
};
