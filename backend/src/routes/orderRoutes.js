import express from "express";
import { protect, admin, optionalAuth } from "../middlewares/authMiddleware.js";
import {
  getAllOrders,
  getMyOrders,
  getOrdersFromFilter,
  getOrderById,
  updateOrderStatus,
  placeOrder,
} from "../controllers/orderController.js";
const router = express.Router();

// public
router.get("/filter", getOrdersFromFilter);
router.get("/:id", optionalAuth, getOrderById);

// private
router.get("/user/my-orders", protect, getMyOrders);
router.patch("/:id", optionalAuth, updateOrderStatus);

// admin
router.get("/", protect, admin, getAllOrders);

// đặt hàng
router.post("/", optionalAuth, placeOrder);

export default router;
