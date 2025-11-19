import express from "express";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import {
  validateAndGetCart,
  getCartMiddleware,
} from "../middlewares/cartMiddleware.js";
import {
  getCart,
  addProductToCart,
  updateQuantityOfProductInCart,
  removeProductFromCart,
} from "../controllers/cartController.js";
const router = express.Router();

// Public
router.get("/", optionalAuth, getCartMiddleware, getCart);
router.post("/", optionalAuth, validateAndGetCart, addProductToCart);
router.patch(
  "/products",
  optionalAuth,
  validateAndGetCart,
  updateQuantityOfProductInCart
);
router.delete(
  "/products",
  optionalAuth,
  validateAndGetCart,
  removeProductFromCart
);

export default router;
