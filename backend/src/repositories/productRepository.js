import Product from "../models/Product.js";

export const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

// populateProduct
export const populateProduct = async (productId, populatePaths) => {
  return await Product.findById(productId).populate(populatePaths);
};

// tìm theo sku
export const findProductBySKU = async (sku) => {
  return await Product.findOne({ sku });
};

// tìm theo tên
export const findProductByName = async (name) => {
  return await Product.findOne({ name });
};

// tìm theo id và xoá
export const findProductByIdAndDelete = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};

// validate
export const productValidate = async (product) => {
  return await product.validate();
};

// save
export const productSave = async (product) => {
  return await product.save();
};
