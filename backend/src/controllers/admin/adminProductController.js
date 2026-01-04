import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import Collection from "../../models/Collection.js";

import * as productService from "../../services/productService.js";
import * as productRepository from "../../repositories/productRepository.js";

// get products
export const getAdminProducts = async (req, res) => {
  try {
    const {
      status,
      category,
      productCollection,
      gender,
      hasDiscount,
      featured,
      page = 1,
      limit = 15,
      search,
      sort = "newest",
    } = req.query;

    const pipeline = [];

    // 🔹 STAGE 1: MATCH - Lọc theo các điều kiện (không tự động filter isPublished)
    const matchStage = {};

    // lọc theo trạng thái publish
    if (status === "published") {
      matchStage.isPublished = true;
    } else if (status === "draft") {
      matchStage.isPublished = false;
    } else if (status === "inStock") {
      matchStage.$expr = {
        $gt: [
          {
            $reduce: {
              input: "$variants",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $reduce: {
                      input: "$$this.sizes",
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this.countInStock"] },
                    },
                  },
                ],
              },
            },
          },
          0,
        ],
      };
    } else if (status === "outOfStock") {
      // Lọc theo tình trạng stock
      // Sản phẩm không còn size nào có stock > 0
      matchStage.$expr = {
        $eq: [
          {
            $reduce: {
              input: "$variants",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $reduce: {
                      input: "$$this.sizes",
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this.countInStock"] },
                    },
                  },
                ],
              },
            },
          },
          0,
        ],
      };
    } else if (status === "lowStock") {
      // Sản phẩm có tổng stock <= 10
      matchStage.$expr = {
        $lte: [
          {
            $reduce: {
              input: "$variants",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $reduce: {
                      input: "$$this.sizes",
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this.countInStock"] },
                    },
                  },
                ],
              },
            },
          },
          10,
        ],
      };
    } else if (status === "featured") {
      matchStage.isFeatured = true;
    } else if (status === "hasDiscount") {
      matchStage.discountPrice = { $exists: true, $ne: null, $gt: 0 };
    }

    // Lọc theo category
    if (category && category === "none") {
      matchStage.category = null;
    } else if (category !== "allCategories") {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchStage.category = new mongoose.Types.ObjectId(category);
      } else {
        console.warn("category ID không hợp lệ:", category);
      }
    }

    // Lọc theo Collection
    if (productCollection && productCollection !== "allCollections") {
      if (mongoose.Types.ObjectId.isValid(productCollection)) {
        matchStage.productCollection = new mongoose.Types.ObjectId(
          productCollection
        );
      } else {
        console.warn("productCollection ID không hợp lệ:", productCollection);
      }
    }

    // Lọc theo Gender
    if (gender && gender !== "allGender") {
      matchStage.gender = { $in: gender.split(",") };
    }

    // Lọc theo discount
    // if (hasDiscount === "true") {
    //   matchStage.discountPrice = { $exists: true, $ne: null, $gt: 0 };
    // }

    // Lọc theo search
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Thêm match stage vào pipeline nếu có điều kiện
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 🔹 STAGE 2: ADD FIELDS - Thêm các field tính toán cho admin
    pipeline.push({
      $addFields: {
        // TÍnh tổng stock
        totalStock: {
          $reduce: {
            input: "$variants",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $reduce: {
                    input: "$$this.sizes",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.countInStock"] },
                  },
                },
              ],
            },
          },
        },
        // Tính số lượng biến thể màu
        variantCount: { $size: "$variants" },
        // Tổng số lượng sizes có sẵn
        totalSizes: {
          $reduce: {
            input: "$variants",
            initialValue: 0,
            in: { $add: ["$$value", { $size: "$$this.sizes" }] },
          },
        },
        // kiểm tra có discount không
        hasDiscount: {
          $and: [
            { $ifNull: ["$discountPrice", false] },
            { $gt: ["$discountPrice", 0] },
            { $lt: ["$discountPrice", "$price"] },
          ],
        },
        // tính phần trăm discount
        discountPercentage: {
          $cond: {
            if: {
              $and: [
                { $ifNull: ["$discountPrice", false] },
                { $gt: ["$discountPrice", 0] },
                { $lt: ["$discountPrice", "$price"] },
              ],
            },
            then: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$price", "$discountPrice"] },
                        "$price",
                      ],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
            else: 0,
          },
        },
        // Display price (giá hiển thị)
        displayPrice: {
          $cond: {
            if: {
              $and: [
                { $ifNull: ["$discountPrice", false] },
                { $gt: ["$discountPrice", 0] },
                { $lt: ["$discountPrice", "$price"] },
              ],
            },
            then: "$discountPrice",
            else: "$price",
          },
        },
      },
    });

    // 🔹 STAGE 3: LOOKUP - Populate category
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    });

    // 🔹 STAGE 4: LOOKUP - Populate productCollection
    pipeline.push({
      $lookup: {
        from: "collections",
        localField: "productCollection",
        foreignField: "_id",
        as: "productCollection",
      },
    });

    // 🔹 STAGE 5: LOOKUP - Populate user
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    // 🔹 STAGE 6: PROJECT - Chỉ lấy các field cần thiết cho admin
    pipeline.push({
      $project: {
        // Basic info
        name: 1,
        sku: 1,
        price: 1,
        discountPrice: 1,
        description: 1,
        variants: 1,
        gender: 1,
        // material: 1,
        tags: 1,

        // Admin specific fields
        isPublished: 1,
        isFeatured: 1,
        rating: 1,
        numReviews: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,

        // Calculated fields
        totalStock: 1,
        variantCount: 1,
        totalSizes: 1,
        hasDiscount: 1,
        discountPercentage: 1,
        displayPrice: 1,

        // Populated data
        category: {
          $arrayElemAt: [
            {
              $map: {
                input: "$category",
                as: "cat",
                in: {
                  _id: "$$cat._id",
                  name: "$$cat.name",
                  slug: "$$cat.slug",
                },
              },
            },
            0,
          ],
        },
        productCollection: {
          $arrayElemAt: [
            {
              $map: {
                input: "$productCollection",
                as: "col",
                in: {
                  _id: "$$col._id",
                  name: "$$col.name",
                  slug: "$$col.slug",
                },
              },
            },
            0,
          ],
        },
        user: {
          $arrayElemAt: [
            {
              $map: {
                input: "$user",
                as: "usr",
                in: {
                  _id: "$$usr._id",
                  name: "$$usr.name",
                  email: "$$usr.email",
                },
              },
            },
            0,
          ],
        },
      },
    });

    // 🔹 STAGE 7: SORT - Sắp xếp
    let sortStage = {};

    switch (sort) {
      case "nameAsc":
        sortStage = { name: 1 };
        break;
      case "nameDesc":
        sortStage = { name: -1 };
        break;
      case "priceAsc":
        sortStage = { displayPrice: 1 };
        break;
      case "priceDesc":
        sortStage = { displayPrice: -1 };
        break;
      case "stockAsc":
        sortStage = { totalStock: 1 };
        break;
      case "stockDesc":
        sortStage = { totalStock: -1 };
        break;
      case "discount":
        sortStage = { discountPercentage: -1 };
        break;
      case "rating":
        sortStage = { rating: -1 };
        break;
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "newest": // "newest"
        sortStage = { createdAt: -1 };
        break;
      default:
        break;
    }

    pipeline.push({ $sort: sortStage });

    // 🔹 STAGE 8: PAGINATION - Phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Tạo pipeline cho count (không có skip, limit)
    const countPipeline = [...pipeline];

    // Thêm skip và limit vào pipeline chính
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // 🔹 THỰC THI SONG SONG: Lấy cả products và total count
    const [products, totalResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.aggregate([...countPipeline, { $count: "total" }]),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 🔹 KẾT QUẢ
    res.json({
      success: true,
      products,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAdminProducts:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// get product details
export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.productDetails(productId);

    res.json({
      success: true,
      message: `Lấy chi tiết sản phẩm "${product.name}" thành công!`,
      product,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getProductDetails", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// create product
export const createProduct = async (req, res) => {
  try {
    // console.log("📝 Bắt đầu tạo sản phẩm với BODY:",JSON.stringify(req.body, null, 2));

    // const {name,description,price,discountPrice,sku,category,variants,productCollection,material,gender = "Unisex",tags = [],metaTitle,metaDescription,metaKeywords,dimensions,weight,
    //   // isFeatured = false,
    //   // isPublished = true,
    // } = req.body;

    const productData = req.body;
    const userId = req.user._id;

    // kiểm tra các trường cơ bản
    const missingFields = productService.validateProductData(productData);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
        missingFields,
      });
    }

    // tạo sản phẩm và kiểm tra trước khi lưu vào database
    // check category, collection, sku, name tồn tại
    // check variant
    const product = await productService.createProductData(productData, userId);

    // Lưu sản phẩm vào database
    const createdProduct = await productRepository.createProduct(product);

    // populate
    const populatePaths = [
      { path: "category", select: "name slug" },
      { path: "user", select: "name email" },
    ];

    if (createdProduct.productCollection) {
      populatePaths.push({ path: "productCollection", select: "name slug" });
    }

    const populatedProduct = await productRepository.populateProduct(
      createdProduct._id,
      populatePaths
    );

    res.status(201).json({
      success: true,
      message: "Sản phẩm đã được tạo thành công",
      product: populatedProduct,
    });
  } catch (error) {
    // Handle specific error types
    if (
      error.message.includes("đã tồn tại") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("Thiếu")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm",
      error: error.message,
    });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Tìm, xoá, trả về product đã xoá
    const { deletedProduct, deletedImagesCount } =
      await productService.handleDeleteProduct(productId);

    res.json({
      success: true,
      message: `Đã xóa sản phẩm "${deletedProduct.name}" thành công`,
      deletedProduct: {
        _id: deletedProduct._id,
        name: deletedProduct.name,
        variantsCount: deletedProduct.variants?.length || 0,
      },
      imagesDeleted: {
        count: deletedImagesCount,
        message:
          deletedImagesCount > 0
            ? `Đã xoá ${deletedImagesCount} ảnh từ Cloudinary`
            : "Sản phẩm không có ảnh để xoá",
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
  }
};

// update basic field Product
export const updateBasicFieldsProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData = req.body;

    const updatedProduct = await productService.updateBasicFields(
      productId,
      productData
    );

    res.json({
      success: true,
      message: "Cập nhật các trường cơ bản thành công!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi gọi update basic fields product:", error);
    res
      .status(error.message.includes("tồn tại" || "Không có data") ? 400 : 500)
      .json({ message: error.message });
  }
};

// update countInStock
export const updateCountInStockProduct = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stocks } = req.body;

    const { updatedProduct, updatedVariant } =
      await productService.updateCountInStock(productId, variantId, stocks);

    res.json({
      success: true,
      message: "Cập nhật số lượng cho biến thể thành công",
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi updateCountInStockProduct:", error);
    res
      .status(error.message.includes("tồn tại" || "Không") ? 400 : 500)
      .json({ message: error.message });
  }
};

// update color variant
export const updateColoVariants = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { colorName, colorHex } = req.body;

    const { updatedProduct, updatedVariant } = await productService.updateColor(
      productId,
      variantId,
      colorName,
      colorHex
    );
    res.json({
      success: true,
      message: "Thay đổi màu sắc thành công!",
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi updateColoVariants:", error);
    res
      .status(error.message.includes("tồn tại" || "Không") ? 400 : 500)
      .json({ message: error.message });
  }
};

// add sizes variant
export const addSizesVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { sizes } = req.body;

    const { updatedProduct, updatedVariant } = await productService.addSizes(
      productId,
      variantId,
      sizes
    );
    res.json({
      success: true,
      message: "Thêm size cho biến thể thành công!",
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi addSizesVariant:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// delete sizes variant
export const deleteSizesVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { sizes } = req.body;

    const { updatedProduct, updatedVariant } = await productService.deleteSize(
      productId,
      variantId,
      sizes
    );

    res.json({
      success: true,
      message: "Xoá size cho biến thể thành công!",
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: updatedVariant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deleteSizesVariant:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// add images variant
export const addImagesVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { images } = req.body;

    const { updatedProduct, variant } = await productService.addImages(
      productId,
      variantId,
      images
    );

    res.json({
      success: true,
      message: `Thêm ảnh cho variant màu ${variant.colorName} thành công`,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: variant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deleteSizesVariant:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// delete images variant
export const removeImagesVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { publicIds } = req.body;

    const { updatedProduct, variant } = await productService.removeImages(
      productId,
      variantId,
      publicIds
    );

    res.json({
      success: true,
      message: `Xoá ảnh của variant màu ${variant.colorName} thành công`,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
      },
      variant: variant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi removeImagesVariant:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// add variants
export const addProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variant } = req.body;

    const updatedProduct = await productService.addVariants(productId, variant);

    res.json({
      success: true,
      message: "Thêm biến thể thành công!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi gọi addProductVariants:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// remove variants
export const removeProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantIds } = req.body;

    const updatedProduct = await productService.removeVariants(
      productId,
      variantIds
    );

    res.json({
      success: true,
      message: "Xoá biến thể thành công!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi gọi removeProductVariants:", error);
    const status =
      error.message.includes("tồn tại") ||
      error.message.includes("Không") ||
      error.message.includes("Lỗi!")
        ? 400
        : 500;
    res.status(status).json({ message: error.message });
  }
};

// !isPublish product
export const toggleProductPublished = async (req, res) => {
  try {
    const { _id } = req.body;

    // Tìm và kiểm tra
    const updatedProduct = await productService.toggleProductPublished(_id);

    res.json({
      success: true,
      message: `Đã ${
        updatedProduct.isPublished ? "Hiện" : "Ẩn"
      } sản phẩm thành công!`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi gọi toggleProductPublished:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// toggle isFeatured
export const toggleProductFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await productService.toggleProductFeatured(id);
    res.json({
      success: true,
      message: `Sản phẩm đã ${
        updatedProduct.isFeatured ? "được" : "bỏ"
      } nổi bật`,
      product: updatedProduct,
    });
  } catch (error) {
    if (
      error.message.includes("không tìm thấy") ||
      error.message.includes("Không thể nổi bật sản phẩm đang bị ẩn!")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi gọi toggleProductFeatured",
      error: error.message,
    });
  }
};
