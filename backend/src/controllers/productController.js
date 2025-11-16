import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";

// @route GET /api/products
// @desc Get all products
// @access Public
export const getAllProducts = async (req, res) => {
  try {
    const {
      category, // Lọc theo danh mục
      productCollection, // Lọc theo bộ sưu tập
      gender, // Lọc theo giới tính
      minPrice, // Giá tối thiểu
      maxPrice, // Giá tối đa
      page = 1, // Trang hiện tại (mặc định trang 1)
      limit = 12, // Số sản phẩm mỗi trang (mặc định 12)
      sort = "-createdAt", // Sắp xếp (mặc định mới nhất trước)
    } = req.query;

    let filter = { isPublished: true };

    // Thêm điều kiện lọc nếu có trong query
    if (category) filter.category = category;
    if (productCollection) filter.productCollection = productCollection;
    if (gender) filter.gender = gender;

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {}; // Tạo object price để thêm điều kiện
      if (minPrice) filter.price.$gte = Number(minPrice); // Giá >= minPrice
      if (maxPrice) filter.price.$lte = Number(maxPrice); // Giá <= maxPrice
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("productCollection", "name slug")
      .populate("user", "name email")
      .sort(sort)
      .limit(limit * 1) // Giới hạn số lượng (limit * 1 để chuyển string thành number)
      .skip((page - 1) * limit); // Bỏ qua các sản phẩm của trang trước

    // Đếm tổng số sản phẩm phù hợp với filter (cho pagination)
    const total = await Product.countDocuments(filter);

    // Kết quả
    res.json({
      products, // Danh sách sản phẩm
      totalPages: Math.ceil(total / limit), // Tổng số trang
      currentPage: page, // Trang hiện tại
      total, // Tổng số sản phẩm
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllProducts:", error);
    res.status(500).json({ message: "Server error" });
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

// @route POST /api/products
// @desc Create products
// @access Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      sku,
      category,
      variants,
      collection,
      material,
      gender,
      tags,
    } = req.body;

    const categoryExists = await Category.findById(category);

    if (!categoryExists)
      return res.status(404).json({ message: "Loại sản phẩm không tồn tại!" });

    if (collection) {
      const collectionExists = await Collection.findById(collection);

      if (!collectionExists)
        return res.status(404).json({ message: "Bộ sưu tập không tồn tại!" });
    }

    const existingProduct = await Product.findOne({ sku });

    if (existingProduct)
      return res.status(400).json({ message: "SKU đã tồn tại" });

    const variantsWithSlug = variants.map((variant) => ({
      ...variant,
      colorSlug: variant.colorName
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    }));

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      sku,
      category,
      variants: variantsWithSlug,
      collection,
      material,
      gender,
      tags,
      user: req.user._id,
    });

    const createdProduct = await product.save();

    await createdProduct.populate("category", "name slug");
    if (collection) {
      await createdProduct.populate("collection", "name slug");
    }
    await createdProduct.populate("user", "name email");

    res.status(201).json(createdProduct);
  } catch (error) {
    // if (error.code === 11000) {
    //   return res.status(400).json({ message: "SKU đã tồn tại" });
    // }
    console.error("Lỗi khi gọi createProduct:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /api/products/:id
// @desc update products details
// @access Public
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      sku,
      category,
      // variants,
      productCollection,
      material,
      gender,
      tags,
      isFeatured,
      isPublished,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct)
        return res.status(400).json({ message: "SKU đã tồn tại" });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res
          .status(404)
          .json({ message: "Loại sản phẩm không tồn tại!" });
      }
    }

    if (productCollection) {
      const collectionExists = await Collection.findById(productCollection);
      if (!collectionExists) {
        return res.status(404).json({ message: "Bộ sưu tập không tồn tại!" });
      }
    }

    const oldName = product.name;
    // const oldVariants = product.variants;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discountPrice =
      discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.sku = sku || product.sku;
    product.category = category || product.category;
    // product.variants = variants || product.variants;
    product.productCollection =
      productCollection !== undefined
        ? productCollection
        : product.productCollection;
    product.material = material || product.material;
    product.gender = gender || product.gender;
    product.tags = tags || product.tags;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isPublished =
      isPublished !== undefined ? isPublished : product.isPublished;

    if (name && name !== oldName) {
      product.slug = name
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

    // if (variants && Array.isArray(variants) && variants !== oldVariants) {
    //   const updatedVariants = variants.map((variant) => {
    //     // // ✅ TÌM VARIANT CŨ BẰNG colorSlug
    //     // const existingVariant = product.variants.find(
    //     //   (v) =>
    //     //     v.colorSlug ===
    //     //     variant.colorName
    //     //       .replace(/Đ/g, "D")
    //     //       .replace(/đ/g, "d")
    //     //       .normalize("NFD")
    //     //       .replace(/[\u0300-\u036f]/g, "")
    //     //       .trim()
    //     //       .toLowerCase()
    //     //       .replace(/[^a-z0-9 -]/g, "")
    //     //       .replace(/\s+/g, "-")
    //     //       .replace(/-+/g, "-")
    //     // );

    //     // // Nếu là variant cũ, merge với data mới
    //     // if (existingVariant) {
    //     //   return {
    //     //     ...existingVariant, // Giữ data cũ
    //     //     ...variant, // Ghi đè data mới
    //     //     colorSlug: existingVariant.colorSlug, // Giữ nguyên slug
    //     //   };
    //     // }

    //     // ✅ VARIANT MỚI - TẠO SLUG
    //     return {
    //       ...variant,
    //       colorSlug: variant.colorName
    //         .replace(/Đ/g, "D")
    //         .replace(/đ/g, "d")
    //         .normalize("NFD")
    //         .replace(/[\u0300-\u036f]/g, "")
    //         .trim()
    //         .toLowerCase()
    //         .replace(/[^a-z0-9 -]/g, "")
    //         .replace(/\s+/g, "-")
    //         .replace(/-+/g, "-"),
    //     };
    //   });

    //   product.variants = updatedVariants;
    // }

    const updatedProduct = await product.save();

    // Populate thông tin
    await updatedProduct.populate("category", "name slug");
    if (updatedProduct.productCollection) {
      await updatedProduct.populate("productCollection", "name slug");
    }
    await updatedProduct.populate("user", "name email");

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @route   DELETE /api/products/:id
// @desc    delete product
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Đã xóa sản phẩm thành công",
      deletedProduct: {
        id: product._id,
        name: product.name,
        sku: product.sku,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @route   PATCH /api/products/:id/featured
// @desc    toggle featured product
// @access  Private/Admin
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
      message: `Sản phẩm ${
        product.isFeatured ? "đã được" : "không còn"
      } nổi bật!`,
    });
  } catch (error) {
    console.error("Lỗi khi gọi toggleFeaturedProduct: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   PATCH /api/products/:id/published
// @desc    toggle published product
// @access  Private/Admin
export const togglePublishedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    product.isPublished = !product.isPublished;
    await product.save();

    res.json({
      message: `Sản phẩm đã được ${product.isPublished ? "hiển thị" : "ẩn"}`,
    });
  } catch (error) {
    console.error("Lỗi khi gọi togglePublishedProduct: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    add variants to product
// @route   PATCH /api/products/:id/variants
// @access  Private/Admin
export const addVariants = async (req, res) => {
  try {
    const { variants } = req.body;

    if (!variants) {
      return res.status(400).json({
        message: "Thiếu dữ liệu variants",
        details: "Cần gửi { variants: [...] } trong request body",
      });
    }

    if (!Array.isArray(variants)) {
      return res.status(400).json({
        message: "Dữ liệu variants không hợp lệ",
        details: "Variants phải là một mảng",
      });
    }

    if (variants.length === 0) {
      return res.status(400).json({
        message: "Danh sách variants trống",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    const results = {
      added: [],
      skipped: [],
    };

    for (const variantData of variants) {
      if (!variantData || !variantData.colorName) {
        results.skipped.push({
          data: variantData,
          reason: "Thiếu colorName hoặc dữ liệu không hợp lệ",
        });
        continue;
      }

      const { colorName, colorHex, sizes, images } = variantData;

      const colorSlug = colorName
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const existingVariant = product.variants.find(
        (v) => v.colorSlug === colorSlug
      );

      if (existingVariant) {
        results.skipped.push({
          colorName,
          reason: "Màu sắc đã tồn tại",
        });
        continue;
      }

      const newVariant = {
        colorName,
        colorSlug,
        colorHex: colorHex || "",
        sizes: sizes || [],
        images: images || [],
      };

      product.variants.push(newVariant);
      results.added.push(newVariant);
    }

    if (results.added.length > 0) {
      await product.save();

      await product.populate("category", "name slug");
      if (product.productCollection) {
        await product.populate("productCollection", "name slug");
      }
    }

    res.json({
      message: `Đã thêm ${results.added.length ?? 0} variants, bỏ qua ${
        results.skipped.length ?? 0
      } variants`,
      results,
      product,
    });
  } catch (error) {
    console.error("Lỗi khi gọi addVariants: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    update variant from product
// @route   PATCH /api/products/:id/variants/:colorSlug
// @access  Private/Admin
export const updateVariant = async (req, res) => {
  try {
    const { productId, colorSlug } = req.params;
    const { colorName, colorHex } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    const variantIndex = product.variants.findIndex(
      (v) => v.colorSlug.toLowerCase() === colorSlug.toLowerCase()
    );
    if (variantIndex === -1)
      return res.status(404).json({ message: "Không tìm thấy màu sắc" });

    const isColorNameExists = product.variants.some(
      (v, index) => index !== variantIndex && v.colorName === colorName
    );

    const isColorHexExists = product.variants.some(
      (v, index) => index !== variantIndex && v.colorHex === (colorHex || "")
    );

    if (isColorNameExists) {
      return res.status(400).json({ message: "Sản phẩm đã có màu sắc này" });
    }

    if (isColorHexExists) {
      return res.status(400).json({ message: "Sản phẩm đã có mã màu này" });
    }

    product.variants[variantIndex].colorName = colorName;
    if (colorHex) {
      product.variants[variantIndex].colorHex = colorHex || "";
    }
    product.variants[variantIndex].colorSlug = colorName
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    await product.save();
    res.json(product.variants[variantIndex]);
  } catch (error) {
    console.error("Lỗi khi gọi deleteVariant: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    delete variant from product
// @route   DELETE /api/products/:id/variants/:colorSlug
// @access  Private/Admin
export const deleteVariant = async (req, res) => {
  try {
    const { productId, colorSlug } = req.params;

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    const variantIndex = product.variants.findIndex(
      (v) => v.colorSlug.toLowerCase() === colorSlug.toLowerCase()
    );

    if (variantIndex === -1)
      return res.status(404).json({ message: "Không tìm thấy màu sắc" });

    const deletedVariant = product.variants[variantIndex];
    product.variants.splice(variantIndex, 1);

    const updatedProduct = await product.save();

    res.json({
      message: "Đã xóa variant thành công",
      deletedVariant,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deleteVariant: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    update countInStock from product
// @route   PATCH /api/products/:id/variants/:colorSlug
// @access  Private/Admin
export const updateVariantStock = async (req, res) => {
  try {
    const { productId, colorSlug } = req.params;
    const { stocks } = req.body;
    const errors = [];

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    // Tìm variant
    const variant = product.variants.find((v) => v.colorSlug === colorSlug);
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy màu sắc" });
    }

    // Update nhiều sizes
    // stocks.forEach((stock) => {
    //   const size = variant.sizes.find((s) => s.name === (stock.sizeName || ""));
    //   if (!size) errors.push(`Size ${stock.sizeName} không tồn tại`);

    //   if (typeof stock.countInStock !== "number" && stock.countInStock < 0)
    //     errors.push(
    //       `Số lượng ${stock.countInStock} không hợp lệ cho size ${stock.sizeName}`
    //     );

    //   if (errors.length <= 0) {
    //     size.countInStock = stock.countInStock;
    //   }
    // });

    for (const stock of stocks) {
      const size = variant.sizes.find((s) => s.name === (stock.sizeName || ""));
      if (!size) errors.push(`Size ${stock.sizeName} không tồn tại`);

      if (typeof stock.countInStock !== "number" || stock.countInStock < 0)
        errors.push(
          `Số lượng ${stock.countInStock} không hợp lệ cho size ${stock.sizeName}`
        );

      if (errors.length === 0 && size) {
        size.countInStock = stock.countInStock;
      }
    }

    if (errors.length === 0) {
      await product.save();
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Có lỗi xảy ra, số lượng chưa được cập nhật!",
        errors,
      });
    }

    res.json({
      message: "Cập nhật tồn kho hàng loạt thành công",
      updatedStocks: stocks,
    });
  } catch (error) {
    console.error("Lỗi khi gọi updateVariantStock:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    add images to variant
// @route   PATCH /api/products/:productId/variants/:colorSlug/images
// @access  Private/Admin
export const addImagesVariant = async (req, res) => {
  try {
    const { productId, colorSlug } = req.params;
    const { images } = req.body;

    if (!images) {
      return res.status(400).json({
        message: "Thiếu dữ liệu images",
        details: "Cần gửi { images: [...] } trong request body",
      });
    }

    if (!Array.isArray(images)) {
      return res.status(400).json({
        message: "Dữ liệu images không hợp lệ",
        details: "Images phải là một mảng",
      });
    }

    if (images.length === 0) {
      return res.status(400).json({
        message: "Danh sách images trống",
      });
    }

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

    const variant = product.variants.find((v) => v.colorSlug === colorSlug);

    if (!variant)
      return res.status(404).json({ message: "Không tìm thấy variant!" });

    const results = {
      added: [],
      skipped: [],
    };

    for (const imageData of images) {
      if (!imageData || !imageData.url) {
        results.skipped.push({
          data: imageData,
          reason: "Thiếu url hoặc dữ liệu không hợp lệ",
        });
        continue;
      }

      const { url } = imageData;

      const altText = url
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const existingImage = variant.images.find((i) => i.url === url);

      if (existingImage) {
        results.skipped.push({
          url,
          reason: "hình ảnh đã tồn tại",
        });
        continue;
      }

      const newImage = {
        url,
        altText: altText || "",
      };

      variant.images.push(newImage);
      results.added.push(newImage);
    }

    if (results.added.length > 0) await product.save();

    res.json({
      message: `Đã thêm ${results.added.length ?? 0} images, bỏ qua ${
        results.skipped.length ?? 0
      } images`,
      results,
      variant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi addImagesVariant: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    update image to variant
// @route   PATCH /api/products/:productId/variants/:colorSlug/:imageId
// @access  Private/Admin
export const updateImageVariant = async (req, res) => {
  try {
    const { productId, colorSlug, imageId } = req.params;
    const { url } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    const variant = product.variants.find(
      (v) => v.colorSlug.toLowerCase() === colorSlug.toLowerCase()
    );

    if (!variant)
      return res.status(404).json({ message: "Variant không tồn tại!" });

    const imageIndex = variant.images.findIndex((i) => i._id.equals(imageId));

    if (imageIndex === -1)
      return res.status(404).json({ message: "Không tìm thấy hình ảnh" });

    const isUrlExists = variant.images.some(
      (i, index) => index !== imageIndex && i.url === url
    );
    if (isUrlExists)
      return res
        .status(400)
        .json({ message: "Biến thể sản phẩm đã có hình ảnh này" });

    variant.images[imageIndex].url = url;

    variant.images[imageIndex].altText = url;

    await product.save();

    res.json(variant.images[imageIndex]);
  } catch (error) {
    console.error("Lỗi khi gọi updateImageVariant: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    delete image to variant
// @route   DELETE /api/products/:productId/variants/:colorSlug/:imageId
// @access  Private/Admin
export const deleteImageVariant = async (req, res) => {
  try {
    const { productId, colorSlug, imageId } = req.params;
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

    const variant = product.variants.find((v) => v.colorSlug === colorSlug);

    if (!variant)
      return res.status(404).json({ message: "Variant không tồn tại!" });

    const imageIndex = variant.images.findIndex((i) => i._id.equals(imageId));

    if (imageIndex === -1)
      return res.status(404).json({ message: "Hình ảnh không tồn tại!" });

    const deletedimage = variant.images[imageIndex];
    variant.images.splice(imageIndex, 1);
    await product.save();

    res.json({
      message: "Xoá hình ảnh thành công",
      deletedimage,
      variant,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deleteImageVariant:", error);
    res.status(500).json({ message: "Server error" });
  }
};
