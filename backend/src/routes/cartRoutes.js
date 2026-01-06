import express from "express";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import { resolveCart } from "../middlewares/cartMiddleware.js";
import {
  getCart,
  addProductToCart,
  updateQuantity,
  removeItem,
} from "../controllers/cartController.js";
const router = express.Router();

// Public
router.get("/", optionalAuth, resolveCart, getCart);
router.post("/", optionalAuth, resolveCart, addProductToCart);
router.patch("/", optionalAuth, resolveCart, updateQuantity);
router.delete("/", optionalAuth, resolveCart, removeItem);

export default router;
