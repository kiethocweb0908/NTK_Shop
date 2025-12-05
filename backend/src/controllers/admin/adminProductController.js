import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import Collection from "../../models/Collection.js";

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
    if (category && category !== "allCategories") {
      // const categoryArray = category.split(",");
      // const validCategories = categoryArray.filter((cat) =>
      //   mongoose.Types.ObjectId.isValid(cat)
      // );

      // if (validCategories.length > 0) {
      //   matchStage.category = {
      //     $in: validCategories.map((cat) => new mongoose.Types.ObjectId(cat)),
      //   };
      // }

      if (mongoose.Types.ObjectId.isValid(category)) {
        matchStage.category = new mongoose.Types.ObjectId(category);
      } else {
        console.warn("Category ID không hợp lệ:", category);
      }
    }

    // Lọc theo Collection
    if (productCollection) {
      const collectionArray = productCollection.split(",");
      const validCollections = collectionArray.filter((col) => {
        mongoose.Types.ObjectId.isValid(col);
      });

      if (validCollections.length > 0) {
        matchStage.productCollection = {
          $in: validCollections.map((col) => new mongoose.Types.ObjectId(col)),
        };
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

// create product
export const createProduct = async (req, res) => {
  try {
    console.log(
      "📝 Bắt đầu tạo sản phẩm với BODY:",
      JSON.stringify(req.body, null, 2)
    );

    const {
      name,
      description,
      price,
      discountPrice,
      sku,
      category,
      variants,
      productCollection,
      material,
      gender = "Unisex",
      tags = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      dimensions,
      weight,
      // isFeatured = false,
      // isPublished = true,
    } = req.body;

    // Log chi tiết variants
    if (variants && Array.isArray(variants)) {
      console.log(`📦 Total variants: ${variants.length}`);
      variants.forEach((variant, idx) => {
        console.log(`🎨 Variant ${idx + 1} - ${variant.colorName}:`);
        console.log(`   - Color: ${variant.colorName} (${variant.colorHex})`);
        console.log(`   - Images: ${variant.images?.length || 0}`);
        console.log(`   - Sizes: ${variant.sizes?.length || 0}`);

        if (variant.images && variant.images.length > 0) {
          console.log(`   - First image structure:`, variant.images[0]);
        }
        if (variant.images && variant.images.length > 0) {
          console.log(`   - First image keys:`, Object.keys(variant.images[0]));
        }
      });
    }

    console.log("📝 Bắt đầu tạo sản phẩm với:", {
      name,
      sku,
      category,
      variantsCount: variants?.length,
      totalImages: variants?.reduce(
        (sum, v) => sum + (v.images?.length || 0),
        0
      ),
    });

    // Validate required fields
    const requiredFields = [
      "name",
      "description",
      "price",
      "sku",
      "category",
      "variants",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("❌ Missing fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
        missingFields,
      });
    }

    // Validate variants có ít nhất 1 variant
    if (!Array.isArray(variants) || variants.length === 0) {
      console.log("❌ No variants array");
      return res
        .status(400)
        .json({ message: "Sản phẩm phải có ít nhất 1 biến thể màu" });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log("❌ Category not found:", category);
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    // Validate collection if provided
    if (productCollection) {
      const collectionExists = await Collection.findById(productCollection);
      if (!collectionExists) {
        return res.status(404).json({ message: "Bộ sưu tập không tồn tại" });
      }
    }

    // Check if SKU already exists
    const existingSKUProduct = await Product.findOne({ sku });
    if (existingSKUProduct) {
      return res.status(400).json({ message: "SKU đã tồn tại" });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    // Validate variants data
    const validatedVariants = [];
    const validationErrors = [];

    variants.forEach((variant, index) => {
      const variantErrors = [];

      // Check required fields for variant
      if (!variant.colorName) {
        variantErrors.push(`Variant ${index + 1}: Thiếu tên màu`);
        console.log(`   ❌ Missing colorName`);
      }

      if (!variant.colorHex) {
        variantErrors.push(`Variant ${index + 1}: Thiếu mã màu`);
        console.log(`   ❌ Missing colorHex`);
      }

      // Check images
      if (
        !variant.images ||
        !Array.isArray(variant.images) ||
        variant.images.length === 0
      ) {
        variantErrors.push(`Variant ${index + 1}: Phải có ít nhất 1 ảnh`);
      } else if (variant.images.length > 10) {
        variantErrors.push(`Variant ${index + 1}: Tối đa 10 ảnh mỗi variant`);
      }

      // Check sizes
      const validSizes =
        variant.sizes?.filter((size) => {
          const isValid =
            size &&
            size.name &&
            typeof size.countInStock === "number" &&
            size.countInStock > 0;
          console.log(
            `   🔍 Size ${size?.name}: valid=${isValid}, stock=${size?.countInStock}`
          );
          return isValid;
        }) || [];

      if (validSizes.length === 0) {
        variantErrors.push(
          `Variant ${index + 1}: Phải có ít nhất 1 size với số lượng > 0`
        );
        console.log(`   ❌ No valid sizes:`, variant.sizes);
      } else {
        console.log(
          `   ✅ Valid sizes:`,
          validSizes.map((s) => `${s.name}: ${s.countInStock}`)
        );
      }

      // Check image structure
      const validImages = [];
      variant.images?.forEach((img, imgIndex) => {
        const hasValidURL = !!img.url || !!img.imageURL;
        const hasPublicId = !!img.publicId;

        console.log(`   🔍 Validating image ${imgIndex}:`, {
          url: img.url,
          imageURL: img.imageURL,
          publicId: img.publicId,
          isValid: hasValidURL && hasPublicId,
        });

        if (!hasValidURL) {
          variantErrors.push(
            `Variant ${index + 1}, Ảnh ${imgIndex + 1}: Thiếu URL`
          );
        }

        if (!hasPublicId) {
          variantErrors.push(
            `Variant ${index + 1}, Ảnh ${imgIndex + 1}: Thiếu publicId`
          );
        } else {
          validImages.push({
            url: img.url || img.imageURL, // Lấy cái nào có
            altText: img.altText || `${variant.colorName} - ${imgIndex + 1}`,
            publicId: img.publicId,
            order: imgIndex,
          });
        }
      });

      if (variantErrors.length === 0) {
        // Generate color slug
        const colorSlug = variant.colorName
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

        validatedVariants.push({
          colorName: variant.colorName,
          colorSlug,
          colorHex: variant.colorHex,
          sizes: validSizes.map((size) => ({
            name: size.name,
            countInStock: parseInt(size.countInStock),
          })),
          images: validImages,
        });
      } else {
        validationErrors.push(...variantErrors);
      }
    });

    if (validationErrors.length > 0) {
      console.log("❌ Validation errors:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Lỗi validation variants",
        errors: validationErrors, // Trả về mảng lỗi chi tiết
        receivedVariants: variants, // Trả về cả data nhận được để debug
      });
    }

    if (validatedVariants.length === 0) {
      return res.status(400).json({ message: "Không có variant hợp lệ" });
    }

    // Create new product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      sku: sku.trim(),
      category,
      variants: validatedVariants,
      productCollection: productCollection || null,
      material: material || null,
      gender: ["Men", "Women", "Unisex"].includes(gender) ? gender : "Unisex",
      tags: Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      dimensions: dimensions
        ? {
            length: parseFloat(dimensions.length) || 0,
            width: parseFloat(dimensions.width) || 0,
            height: parseFloat(dimensions.height) || 0,
          }
        : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      // isFeatured: Boolean(isFeatured),
      // isPublished: Boolean(isPublished),
      user: req.user._id,
    });

    // Validate product trước khi save
    try {
      await product.validate();
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: "Lỗi validation sản phẩm",
        errors: Object.values(validationError.errors).map((err) => err.message),
      });
    }

    // Save product
    const createdProduct = await product.save();

    // Populate related data
    const populateQueries = [
      { path: "category", select: "name slug" },
      { path: "user", select: "name email" },
    ];

    if (productCollection) {
      populateQueries.push({ path: "productCollection", select: "name slug" });
    }
    await createdProduct.populate(populateQueries);

    res.status(201).json({
      success: true,
      message: "Sản phẩm đã được tạo thành công",
      product: createdProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm",
      error: error.message,
    });
  }
};
