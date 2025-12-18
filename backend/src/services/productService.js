import * as productRepository from "../repositories/productRepository.js";

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";

import cloudinary from "../config/cloudinary.config.js";

// Helper functions

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
// tạo colorSlug từ colorName
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

// tìm sản phẩm từ id
export const findProductById = async (_id) => {
  if (!_id) throw new Error("id không hợp lệ");
  const product = await Product.findById(_id);
  if (!product) throw new Error("Không tìm thấy sản phẩm theo id");
  return product;
};

export const findVariantById = async (product, variantId) => {
  if (!product) throw new Error("Không nhận được sản phẩm");
  if (!variantId) throw new Error("_id Không hợp lệ");
  const variant = await product.variants.find(
    (v) => v._id.toString() === variantId.toString()
  );
  if (!variant) throw new Error("Không tìm thấy variant theo id");
  return variant;
};

const validateSizes = (sizes) => {
  if (!sizes) {
    throw new Error("Lỗi! Thiếu dữ liệu sizes");
  }

  if (!Array.isArray(sizes)) {
    throw new Error("Lỗi! Dữ liệu của sizes phải là mảng hợp lệ");
  }

  if (sizes.length === 0) {
    throw new Error("Lỗi! Danh sách sizes rỗng");
  }
};

// lấy tất cả publicIds từ sản phẩm
const getAllPublicIds = (product) => {
  const allPublicIds = [];
  product.variants.forEach((variant) => {
    variant.images.forEach((img) => {
      if (img.publicId) {
        allPublicIds.push(img.publicId);
      }
    });
  });

  return allPublicIds;
};

//======================================
//
// Kiểm tra các trường sản phẩm
export const validateProductData = (data) => {
  const errors = [];

  // Kiểm tra các trường có dữ liệu
  const requiredFields = [
    "name",
    "description",
    "price",
    "sku",
    "category",
    "variants",
  ];
  requiredFields.forEach((field) => {
    if (!data[field]) errors.push(`${field} là bắt buộc`);
  });

  return errors;
};

// -------------------
// Kiểm tra các trường của variant sản phẩm
export const validateVariants = (variants) => {
  const errors = [];
  const validatedVariants = [];

  variants.forEach((variant, index) => {
    const variantErrors = [];

    // Kiểm tra tên màu mã màu
    if (!variant.colorName) variantErrors.push(`Thiếu tên màu`);
    if (!variant.colorHex) variantErrors.push(`Thiếu mã màu`);
    // Kiểm tra images
    if (
      !variant.images ||
      !Array.isArray(variant.images) ||
      variant.images.length === 0
    ) {
      variantErrors.push(`Variant ${index + 1}: Phải có ít nhất 1 ảnh`);
    } else if (variant.images.length > 10) {
      variantErrors.push(`Variant ${index + 1}: Tối đa 10 ảnh mỗi variant`);
    }
    // Kiểm tra sizes
    const validSizes =
      variant.sizes?.filter((size) => {
        const isValid =
          size &&
          size.name &&
          typeof size.countInStock === "number" &&
          size.countInStock > 0;
        return isValid;
      }) || [];
    if (validSizes.length === 0) {
      variantErrors.push(
        `Variant ${index + 1}: Phải có ít nhất 1 size với số lượng > 0`
      );
    }

    const validImages = [];
    variant.images?.forEach((img, imgIndex) => {
      const hasValidURL = !!img.url || !!img.imageURL;
      const hasPublicId = !!img.publicId;

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
      validatedVariants.push({
        colorName: variant.colorName,
        colorSlug: generateSlug(variant.colorName),
        colorHex: variant.colorHex,
        sizes: validSizes.map((size) => ({
          name: size.name,
          countInStock: parseInt(size.countInStock),
        })),
        images: validImages,
      });
    } else {
      errors.push(`Variant ${index + 1}: ${variantErrors.join(", ")}`);
    }
  });

  return { errors, validatedVariants };
};

// Kiểm tra sku và name tồn tại
export const checkExistingProduct = async (sku, name) => {
  const [existingSKU, existingName] = await Promise.all([
    Product.findOne({ sku }),
    Product.findOne({ name }),
  ]);

  return { existingSKU, existingName };
};

// -------------------
// tạo sản phẩm
export const createProductData = async (data, userId) => {
  // kiểm tra danh mục tồn tại
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) throw new Error("Danh mục không tồn tại");

  // kiểm tra bộ sưu tập tồn tại (nếu có)
  if (data.productCollection) {
    const collectionExists = await Collection.findById(data.productCollection);
    if (!collectionExists) throw new Error("Bộ sưu tập không tồn tại");
  }

  // Kiểm tra sku và name tồn tại
  const { existingSKU, existingName } = await checkExistingProduct(
    data.sku,
    data.name
  );
  if (existingSKU) throw new Error("SKU đã tồn tại");
  if (existingName) throw new Error("Tên sản phẩm đã tồn tại");

  // kiểm tra variants
  const { errors: variantErrors, validatedVariants } = validateVariants(
    data.variants
  );
  if (variantErrors.length > 0) throw new Error(variantErrors.join("; "));

  // Create product object
  const product = new Product({
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
    sku: data.sku.trim(),
    category: data.category,
    variants: validatedVariants,
    productCollection: data.productCollection || null,
    material: data.material || "cotton",
    gender: ["Men", "Women", "Unisex"].includes(data.gender)
      ? data.gender
      : "Unisex",
    tags: Array.isArray(data.tags)
      ? data.tags
      : data.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag) || [],
    // metaTitle: data.metaTitle,
    // metaDescription: data.metaDescription,
    // metaKeywords: data.metaKeywords,
    // dimensions: data.dimensions,
    // weight: data.weight,
    user: userId,
  });

  //   await product.validate(); // Mongoose validation

  try {
    await product.validate();
  } catch (validationError) {
    // Throw error để controller bắt
    throw new Error(
      `Lỗi validation sản phẩm: ${Object.values(validationError.errors)
        .map((err) => err.message)
        .join(", ")}`
    );
  }

  return product;
};

// thay đổi ẩn/hiện
export const toggleProductPublished = async (_id) => {
  // tìm và kiểm tra product
  const product = await findProductById(_id);

  const oldStatus = product.isPublished;
  product.isPublished = !product.isPublished;
  if (product.isFeatured && oldStatus === true) product.isFeatured = false;

  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);

  return updatedProduct;
};

// thay đổi nổi bật
export const toggleProductFeatured = async (_id) => {
  const product = await findProductById(_id);

  const oldFeatured = product.isFeatured;
  if (oldFeatured === false && product.isPublished === false)
    throw new Error("Không thể nổi bật sản phẩm đang bị ẩn!");

  product.isFeatured = !product.isFeatured;

  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);
  return updatedProduct;
};

// xử lý xoá sản phẩm và ảnh
export const handleDeleteProduct = async (productId) => {
  const product = await findProductById(productId);

  const allPublicIds = getAllPublicIds(product);
  if (Array.isArray(allPublicIds) && allPublicIds.length > 0) {
    try {
      await cloudinary.api.delete_resources(allPublicIds, {
        type: "upload",
        resource_type: "image",
      });
    } catch (error) {
      throw new Error("Lỗi khi xoá ảnh");
    }
  }

  await productRepository.findProductByIdAndDelete(productId);
  return {
    deletedProduct: product,
    deletedImagesCount: allPublicIds.length,
  };
};

// xem chi tiết sản phẩm
export const productDetails = async (productId) => {
  const product = await findProductById(productId);

  const populatePaths = [
    { path: "category", select: "name slug" },
    { path: "user", select: "name email" },
  ];
  if (product.productCollection)
    populatePaths.push({ path: "productCollection", select: "name slug" });

  const populatedProduct = await productRepository.populateProduct(
    product._id,
    populatePaths
  );

  return populatedProduct;
};

export const updateBasicFields = async (productId, data) => {
  const product = await findProductById(productId);
  if (!data) throw new Error("không có data");

  if (data?.sku && data?.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: data.sku });
    if (existingProduct) throw new Error("SKU đã tồn tại");
  }

  if (data?.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new Error("Loại sản phẩm không tồn tại!");
  }

  if (data?.productCollection) {
    const collectionExists = await Collection.findById(data.productCollection);
    if (!collectionExists) throw new Error("Bộ sưu tập không tồn tại!");
  }

  const oldName = product.name;
  if (data?.name) product.name = data.name || product.name;
  if (data?.sku) product.sku = data.sku || product.sku;
  if (data?.description)
    product.description = data.description || product.description;
  if (data?.price) product.price = data.price || product.price;

  if (Object.prototype.hasOwnProperty.call(data, "discountPrice")) {
    if (data.discountPrice === null) {
      await Product.updateOne(
        { _id: productId },
        { $unset: { discountPrice: "" } }
      );
      delete product.discountPrice;
    } else {
      product.discountPrice = data.discountPrice;
    }
  }

  if (data?.category) product.category = data.category || product.category;
  if (data?.gender) product.gender = data.gender || product.gender;
  if (data?.productCollection)
    product.productCollection = data.productCollection;

  if (data?.name && data.name !== oldName) {
    product.slug = generateSlug(data.name);
  }

  await productRepository.productValidate(product);

  const updatedProduct = await productRepository.productSave(product);

  const populatePaths = [
    { path: "category", select: "name slug" },
    { path: "user", select: "name email" },
  ];
  if (updatedProduct.productCollection)
    populatePaths.push({ path: "productCollection", select: "name slug" });

  const populatedProduct = await productRepository.populateProduct(
    productId,
    populatePaths
  );

  return populatedProduct;
};

// update count in stock
export const updateCountInStock = async (productId, variantId, stocks) => {
  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);
  const errors = [];

  for (const stock of stocks) {
    const size = variant.sizes.find((s) => s.name === stock?.name);
    if (!size) errors.push(`Size ${stock.name} không tồn tại`);

    if (typeof stock.countInStock !== "number" || stock.countInStock < 0) {
      errors.push(
        `Số lượng ${stock.countInStock} không hợp lệ cho size ${stock.name}`
      );
    }

    if (errors.length === 0) {
      size.countInStock = stock.countInStock;
    }
  }

  if (errors.length > 0)
    throw new Error("Không thành công, có lỗi xảy ra", errors);

  await productRepository.productValidate(product);

  const updatedProduct = await productRepository.productSave(product);
  const updatedVariant = await findVariantById(updatedProduct, variantId);
  return { updatedProduct, updatedVariant };
};

// add sizes
export const addSizes = async (productId, variantId, sizes) => {
  validateSizes(sizes);

  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);

  const result = {
    added: [],
    skipped: [],
  };

  for (const size of sizes) {
    if (
      !size ||
      !size.name ||
      size.countInStock < 0 ||
      typeof size.countInStock !== "number"
    ) {
      result.skipped.push({
        size,
        error: "Dữ liệu không hợp lệ",
      });
      continue;
    }
    const existingSize = variant.sizes.find((s) => s.name === size.name);
    if (existingSize) {
      result.skipped.push({
        sizeName: size.name,
        error: "Kích thước đã tồn tại",
      });
      continue;
    }

    const newSize = {
      name: size.name,
      countInStock: size.countInStock || 0,
    };

    variant.sizes.push(newSize);
    result.added.push(newSize);
  }
  variant.sizes.sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.name.toUpperCase());
    const indexB = SIZE_ORDER.indexOf(b.name.toUpperCase());
    return (
      (indexA === -1 ? SIZE_ORDER.length : indexA) -
      (indexB === -1 ? SIZE_ORDER.length : indexB)
    );
  });
  if (result.added.length === 0) throw new Error("Không có size hợp lệ");
  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);
  const updatedVariant = await findVariantById(updatedProduct, variantId);
  return { updatedProduct, updatedVariant };
};

// delete sizes
export const deleteSize = async (productId, variantId, sizes) => {
  validateSizes(sizes);
  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);

  const result = {
    added: [],
    skipped: [],
  };

  for (const size of sizes) {
    if (!size || !size.name) {
      result.skipped.push({
        size,
        error: "Dữ liệu không hợp lệ",
      });
      continue;
    }
    const sizeindex = variant.sizes.findIndex((s) => s.name === size.name);
    if (sizeindex < 0) {
      result.skipped.push({
        sizeName: size.name,
        error: "Kích thước chưa tồn tại để xoá",
      });
      continue;
    }

    variant.sizes.splice(sizeindex, 1);
    result.added.push(size.name);
  }
  variant.sizes.sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(a.name.toUpperCase());
    const indexB = SIZE_ORDER.indexOf(b.name.toUpperCase());
    return (
      (indexA === -1 ? SIZE_ORDER.length : indexA) -
      (indexB === -1 ? SIZE_ORDER.length : indexB)
    );
  });
  if (result.added.length === 0) throw new Error("Không có size hợp lệ");
  await productRepository.productValidate(product);

  const updatedProduct = await productRepository.productSave(product);
  const updatedVariant = await findVariantById(updatedProduct, variantId);
  return { updatedProduct, updatedVariant };
};

// update color
export const updateColor = async (
  productId,
  variantId,
  colorName,
  colorHex
) => {
  if (!colorHex || !colorName) {
    throw new Error("Thiếu dữ liệu");
  }

  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);

  variant.colorName = colorName;
  variant.colorHex = colorHex;

  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);
  const updatedVariant = await findVariantById(updatedProduct, variantId);
  return { updatedProduct, updatedVariant };
};

// add images
export const addImages = async (productId, variantId, images) => {
  if (!images) throw new Error("Lỗi! gửi thiếu dữ liệu images");
  if (!Array.isArray(images))
    throw new Error("Lỗi! images phải là mảng hợp lệ");
  if (images.length === 0) throw new Error("Lỗi! danh sách images trống");

  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);

  const results = {
    added: [],
    skipped: [],
  };

  for (const image of images) {
    if (!image || !image.imageURL || !image.publicId) {
      results.skipped.push({
        data: image,
        error: "Thiếu url hoặc dữ liệu không hợp lệ",
      });
      continue;
    }

    const altText = `${variant.colorName} - ${variant.images.length + 1}`;

    const newImage = {
      publicId: image.publicId,
      url: image.imageURL,
      altText: altText || "",
      order: variant.images.length,
    };

    variant.images.push(newImage);
    results.added.push(newImage);
  }

  if (results.added.length === 0) throw new Error("Không có ảnh hợp lệ");

  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);

  return { updatedProduct, variant };
};

// remove images
export const removeImages = async (productId, variantId, publicIds) => {
  if (!publicIds) throw new Error("Lỗi! thiếu publicIds");

  if (!Array.isArray(publicIds))
    throw new Error("Lỗi! publicIds không phải mảng hợp lệ");

  if (publicIds.length === 0) throw new Error("Lỗi! publicIds là mảng rỗng");

  const product = await findProductById(productId);
  const variant = await findVariantById(product, variantId);

  try {
    await cloudinary.api.delete_resources(publicIds, {
      type: "upload",
      resource_type: "image",
    });
  } catch (error) {
    throw new Error("Lỗi! khi xoá ảnh");
  }

  for (var idx = 0; idx < publicIds.length; idx++) {
    const imageIndex = variant.images.findIndex(
      (img) => img.publicId === publicIds[idx]
    );

    if (imageIndex > -1) variant.images.splice(imageIndex, 1);
  }
  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);

  return { updatedProduct, variant };
};

// add variants
export const addVariants = async (productId, variant) => {
  if (!variant) throw new Error("Lỗi! không có variants");
  const product = await findProductById(productId);

  const colorSlug = generateSlug(variant.colorName);

  if (!product) throw new Error("Lỗi! không có product");
  if (!product.variants) throw new Error("Lỗi! không có variants");
  if (!variant.colorName) throw new Error("Lỗi! không có colorName");
  if (!colorSlug) throw new Error("Lỗi! không có colorSlug");

  const existingVariant = product.variants.find(
    (v) => v.colorSlug === colorSlug
  );

  if (existingVariant)
    throw new Error(`Lỗi! variant ${variant.colorName} này đã tồn tại `);

  const newVariant = {
    colorHex: variant.colorHex,
    colorName: variant.colorName,
    colorSlug,
    sizes: variant.sizes,
    images: variant.images,
  };

  product.variants.push(newVariant);

  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);

  return updatedProduct;
};

// remove variants
export const removeVariants = async (productId, variantIds) => {
  if (!variantIds) throw new Error("Lỗi! thiếu dữ liệu variants");

  if (!Array.isArray(variantIds))
    throw new Error("Lỗi! variants không phải mảng hợp lệ");

  if (variantIds.length === 0) throw new Error("Lỗi! variants là mảng rỗng");

  const product = await findProductById(productId);

  for (let idx = 0; idx < variantIds.length; idx++) {
    const variantIndex = product.variants.findIndex(
      (v) => v._id.toString() === variantIds[idx].toString()
    );

    if (variantIndex < 0) throw new Error("Lỗi! không tìm thấy variant từ _id");

    product.variants.splice(variantIndex, 1);
  }
  await productRepository.productValidate(product);
  const updatedProduct = await productRepository.productSave(product);
  return updatedProduct;
};
