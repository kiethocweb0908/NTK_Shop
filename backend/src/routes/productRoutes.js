import express from "express";
import mongoose from "mongoose";

import {
  //public
  getAllProducts,
  getProduct,
  getSimilarProduct,
  getBestSellerProduct,
  getNewProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import Product from "../models/Product.js";
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
// router.post("/", protect, admin, createProduct);
// -- variants

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

// Add _id cho variant
// router.post("/admin/migrate-variants", async (req, res) => {
//   const products = await Product.find().lean();
//   let totalFixed = 0;

//   for (const product of products) {
//     let updated = false;

//     for (const variant of product.variants) {
//       if (!variant._id) {
//         variant._id = new mongoose.Types.ObjectId();
//         updated = true;
//         totalFixed++;
//       }
//     }

//     if (updated) {
//       await Product.updateOne({ _id: product._id }, product);
//       console.log(
//         `Product ${product._id} updated, fixed ${totalFixed} variants so far`
//       );
//     }
//   }

//   res.json({ message: "Migration done", fixed: totalFixed });
// });

export default router;
