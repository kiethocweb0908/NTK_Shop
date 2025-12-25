import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";

// @route GET /api/products
// @desc Get all products
// @access Public

// export const getAllProducts = async (req, res) => {
//   try {
//     const {
//       category, // Lọc theo danh mục
//       productCollection, // Lọc theo bộ sưu tập
//       gender, // Lọc theo giới tính
//       material,
//       sizes,
//       colors,
//       minPrice, // Giá tối thiểu
//       maxPrice, // Giá tối đa
//       search,
//       page = 1, // Trang hiện tại (mặc định trang 1)
//       limit = 12, // Số sản phẩm mỗi trang (mặc định 12)
//       sort = "default", // Sắp xếp (mặc định mới nhất trước)
//     } = req.query;

//     let filter = { isPublished: true };
//     let sortOptions = {};

//     // Thêm điều kiện lọc nếu có trong query
//     if (category) {
//       // 🎯 SỬA: Xử lý multiple categories
//       const categoryArray = category.split(",");

//       // Kiểm tra nếu tất cả đều là ObjectId hợp lệ
//       const validCategories = categoryArray.filter((cat) =>
//         mongoose.Types.ObjectId.isValid(cat)
//       );

//       if (validCategories.length > 0) {
//         // 🎯 Dùng $in để tìm nhiều categories
//         filter.category = {
//           $in: validCategories.map((cat) => new mongoose.Types.ObjectId(cat)),
//         };
//       }
//     }

//     if (productCollection) {
//       const conllectionArray = productCollection.split(",");

//       const validCollections = conllectionArray.filter((col) => {
//         mongoose.Types.ObjectId.isValid(col);
//       });

//       if (validCollections.length > 0) {
//         filter.productCollection = {
//           $in: validCategories.map((col) => new mongoose.Types.ObjectId(col)),
//         };
//       }
//     }

//     if (gender) {
//       const genderArray = gender.split(",");
//       filter.gender = { $in: genderArray };
//     }

//     if (material) filter.material = { $in: material.split(",") };

//     // 🎯 LỌC THEO NHIỀU SIZES
//     if (sizes) {
//       const sizeArray = sizes.split(","); // ["S", "M", "L"]
//       filter["variants.sizes.name"] = { $in: sizeArray };
//     }

//     // 🎯 LỌC THEO NHIỀU COLORS
//     if (colors) {
//       const colorArray = colors.split(","); // ["den", "do", "xanh"]
//       filter["variants.colorHex"] = { $in: colorArray };
//     }

//     // Lọc theo khoảng giá
//     if (minPrice || maxPrice) {
//       filter.price = {}; // Tạo object price để thêm điều kiện
//       if (minPrice) filter.price.$gte = Number(minPrice); // Giá >= minPrice
//       if (maxPrice) filter.price.$lte = Number(maxPrice); // Giá <= maxPrice
//     }

//     // Lọc theo từ khoá
//     if (search)
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//         { tags: { $in: [new RegExp(search, "i")] } },
//       ];

//     // Sắp xếp
//     if (sort) {
//       switch (sort) {
//         case "priceAsc":
//           sortOptions = { price: 1 };
//           break;
//         case "priceDesc":
//           sortOptions = { price: -1 };
//           break;
//         case "popularity":
//           sortOptions = { rating: -1 };
//           break;
//         case "oldest":
//           sortOptions = { createdAt: 1 };
//           break;
//         default:
//           sortOptions = { createdAt: -1 };
//           break;
//       }
//     }

//     const products = await Product.find(filter)
//       .populate("category", "name slug")
//       .populate("productCollection", "name slug")
//       .populate("user", "name email")
//       .sort(sortOptions)
//       .limit(limit * 1) // Giới hạn số lượng (limit * 1 để chuyển string thành number)
//       .skip((page - 1) * limit); // Bỏ qua các sản phẩm của trang trước

//     // Đếm tổng số sản phẩm phù hợp với filter (cho pagination)
//     const total = await Product.countDocuments(filter);

//     // Kết quả
//     res.json({
//       products, // Danh sách sản phẩm
//       totalPages: Math.ceil(total / limit), // Tổng số trang
//       currentPage: Number(page), // Trang hiện tại
//       total, // Tổng số sản phẩm
//     });
//   } catch (error) {
//     console.error("Lỗi khi gọi getAllProducts:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      productCollection,
      gender,
      material,
      sizes,
      colors,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sort = "default",
    } = req.query;

    // Tạo pipeline array
    const pipeline = [];

    // 🔹 STAGE 1: MATCH - Lọc theo isPublished
    pipeline.push({
      $match: { isPublished: true },
    });

    // 🔹 STAGE 2: ADD FIELDS - Thêm displayPrice và các field tính toán
    pipeline.push({
      $addFields: {
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
        isOnSale: {
          $and: [
            { $ifNull: ["$discountPrice", false] },
            { $gt: ["$discountPrice", 0] },
            { $lt: ["$discountPrice", "$price"] },
          ],
        },
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
      },
    });

    // 🔹 STAGE 3: MATCH - Lọc theo các điều kiện từ query
    const matchStage = {};

    // Lọc theo category (nhiều categories)
    if (category) {
      const categoryArray = category.split(",");
      const validCategories = categoryArray.filter((cat) =>
        mongoose.Types.ObjectId.isValid(cat)
      );

      if (validCategories.length > 0) {
        matchStage.category = {
          $in: validCategories.map((cat) => new mongoose.Types.ObjectId(cat)),
        };
      }
    }

    // Lọc theo productCollection
    if (productCollection) {
      const collectionArray = productCollection.split(",");
      const validCollections = collectionArray.filter((col) =>
        mongoose.Types.ObjectId.isValid(col)
      );

      if (validCollections.length > 0) {
        matchStage.productCollection = {
          $in: validCollections.map((col) => new mongoose.Types.ObjectId(col)),
        };
      }
    }

    // Lọc theo gender
    if (gender) {
      const genderArray = gender.split(",");
      matchStage.gender = { $in: genderArray };
    }

    // Lọc theo material
    if (material) {
      matchStage.material = { $in: material.split(",") };
    }

    // Lọc theo sizes
    if (sizes) {
      const sizeArray = sizes.split(",");
      matchStage["variants.sizes.name"] = { $in: sizeArray };
    }

    // Lọc theo colors
    if (colors) {
      const colorArray = colors.split(",");
      matchStage["variants.colorHex"] = { $in: colorArray };
    }

    // 🔥 QUAN TRỌNG: Lọc theo khoảng giá - SỬ DỤNG DISPLAYPRICE
    if (minPrice || maxPrice) {
      matchStage.displayPrice = {};

      if (minPrice) {
        matchStage.displayPrice.$gte = Number(minPrice);
      }
      if (maxPrice) {
        matchStage.displayPrice.$lte = Number(maxPrice);
      }
    }

    // Lọc theo search
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Thêm match stage vào pipeline nếu có điều kiện
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 🔹 STAGE 4: LOOKUP - Populate category
    pipeline.push({
      $lookup: {
        from: "categories", // Tên collection category
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    });

    // 🔹 STAGE 5: LOOKUP - Populate productCollection
    pipeline.push({
      $lookup: {
        from: "productcollections", // Tên collection productCollection
        localField: "productCollection",
        foreignField: "_id",
        as: "productCollection",
      },
    });

    // 🔹 STAGE 6: LOOKUP - Populate user
    pipeline.push({
      $lookup: {
        from: "users", // Tên collection users
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    // 🔹 STAGE 7: PROJECT - Chỉ lấy các field cần thiết từ populated data
    pipeline.push({
      $project: {
        name: 1,
        price: 1,
        discountPrice: 1,
        displayPrice: 1,
        isOnSale: 1,
        discountPercentage: 1,
        description: 1,
        images: 1,
        variants: 1,
        gender: 1,
        material: 1,
        tags: 1,
        rating: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,
        // Category - chỉ lấy name và slug
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
        // ProductCollection - chỉ lấy name và slug
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
        // User - chỉ lấy name và email
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

    // 🔹 STAGE 8: SORT - Sắp xếp
    let sortStage = {};

    switch (sort) {
      case "priceAsc":
        sortStage = { displayPrice: 1 };
        break;
      case "priceDesc":
        sortStage = { displayPrice: -1 };
        break;
      case "popularity":
        sortStage = { rating: -1 };
        break;
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "discount":
        sortStage = { discountPercentage: -1 }; // Sắp xếp theo % giảm giá
        break;
      default:
        sortStage = { createdAt: -1 };
        break;
    }

    // Ưu tiên sản phẩm giảm giá khi sort mặc định
    if (sort === "default") {
      sortStage = { createdAt: -1, isOnSale: -1 };
    }

    pipeline.push({ $sort: sortStage });

    // 🔹 STAGE 9: PAGINATION - Phân trang
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
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllProducts:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @route GET /api/products/:id
// @desc Get products details
// @access Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug description")
      .populate("productCollection", "name slug image")
      .populate("user", "name email");

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(product);
  } catch (error) {
    console.error("Lỗi khi gọi getProduct:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/products/similar/:productId
// @desc Retrieve similar products based on the current product gender and category
// @access Public
export const getSimilarProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // THÊM DÒNG NÀY ĐỂ TRÁNH CRASH
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    const similarProduct = await Product.find({
      _id: { $ne: id },
      category: product.category,
    }).limit(4);

    res.json(similarProduct);
  } catch (error) {
    console.error("Lỗi khi gọi getSimilarProduct: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/products/best-seller/
// @desc Retrieve the product with highest rating
// @access Public
export const getBestSellerProduct = async (req, res) => {
  try {
    const bestSellerproduct = await Product.findOne().sort({ rating: -1 });

    if (!bestSellerproduct)
      return res
        .status(404)
        .json({ message: "Hiện không tìm thấy sản phẩm best seller!" });

    res.json(bestSellerproduct);
  } catch (error) {
    console.error("Lỗi khi gọi getBestSellerProduct: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products - Creation date
// @access Public
export const getNewProduct = async (req, res) => {
  try {
    const newProduct = await Product.find().sort({ createdAt: -1 }).limit(8);

    if (!newProduct)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(newProduct);
  } catch (error) {
    console.error("Lỗi khi gọi getNewProduct: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
