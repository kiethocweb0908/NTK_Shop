import express from "express";

import {
  //public
  getAllProducts,
  getProduct,
  getSimilarProduct,
  getBestSellerProduct,
  getNewProduct,
  //Private
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeaturedProduct,
  togglePublishedProduct,
  addVariants,
  updateVariant,
  deleteVariant,
  updateVariantStock,
  addImagesVariant,
  updateImageVariant,
  deleteImageVariant,
} from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
// import mongoose from "mongoose";
// import Product from "../models/Product.js";
const router = express.Router();

// Public router
router.get("/", getAllProducts);
router.get("/best-seller", getBestSellerProduct);
router.get("/similar/:id", getSimilarProduct);
router.get("/new-arrivals", getNewProduct);
router.get("/:id", getProduct);

// Protected admin router
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.patch("/:id/featured", protect, admin, toggleFeaturedProduct);
router.patch("/:id/published", protect, admin, togglePublishedProduct);
// -- variants
router.patch("/:id/variants", protect, admin, addVariants);
router.patch("/:productId/variants/:colorSlug", protect, admin, updateVariant);
router.delete("/:productId/variants/:colorSlug", protect, admin, deleteVariant);
router.patch(
  "/:productId/variants/:colorSlug/stock",
  protect,
  admin,
  updateVariantStock
);
router.patch(
  "/:productId/variants/:colorSlug/images",
  protect,
  admin,
  addImagesVariant
);
router.patch(
  "/:productId/variants/:colorSlug/images/:imageId",
  protect,
  admin,
  updateImageVariant
);
router.delete(
  "/:productId/variants/:colorSlug/images/:imageId",
  protect,
  admin,
  deleteImageVariant
);

// Add _id cho img của sản phẩm
// router.post("/admin/migrate-images", async (req, res) => {
//   const products = await Product.find().lean();
//   let totalFixed = 0;

//   for (const product of products) {
//     for (const variant of product.variants) {
//       for (const img of variant.images) {
//         if (!img._id) {
//           img._id = new mongoose.Types.ObjectId();
//           updated = true;
//           totalFixed++;
//         }
//       }
//     }
//     await Product.updateOne({ _id: product._id }, product);
//     console.log(
//       `Product ${product._id} updated, fixed ${totalFixed} images so far`
//     );
//   }

//   res.json({ message: "Migration done", fixed: totalFixed });
// });

export default router;
