import express from "express";
import mongoose from "mongoose";

import {
  //public
  getAllProducts,
  getProduct,
  getSimilarProduct,
  getBestSellerProduct,
  getNewProduct,
  getFeaturedProduct,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import Product from "../models/Product.js";
// import mongoose from "mongoose";
// import Product from "../models/Product.js";
const router = express.Router();

// Public router
router.get("/", getAllProducts);
router.get("/best-seller", getBestSellerProduct);
router.get("/similar/:id", getSimilarProduct);
router.get("/new-arrivals", getNewProduct);
router.get("/featured-products", getFeaturedProduct);
router.get("/:id", getProduct);

export default router;
