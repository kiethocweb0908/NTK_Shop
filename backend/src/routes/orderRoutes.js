import express from "express";
import { protect, admin, optionalAuth } from "../middlewares/authMiddleware.js";
import {
  getAllOrders,
  getMyOrders,
  getOrdersFromFilter,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
const router = express.Router();

// public
router.get("/filter", getOrdersFromFilter);
router.get("/:id", optionalAuth, getOrderById);
router.post("/", optionalAuth, createOrder);

// private
router.get("/my-orders", protect, getMyOrders);
router.patch("/:id", optionalAuth, updateOrderStatus);

// admin
router.get("/", protect, admin, getAllOrders);
export default router;
