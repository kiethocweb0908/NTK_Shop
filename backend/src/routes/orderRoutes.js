import express from "express";
import { protect, optionalAuth } from "../middlewares/authMiddleware.js";
import {
  getMyOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
  completedOrder,
} from "../controllers/orderController.js";
const router = express.Router();

// public
router.get("/:id", optionalAuth, getOrderById);

// private
router.get("/user/my-orders", protect, getMyOrders);

// đặt hàng
router.post("/", optionalAuth, placeOrder);
// huỷ đơn
router.patch("/:orderId/cancel", optionalAuth, cancelOrder);
// nhận hàng
router.patch("/:orderId/completed", optionalAuth, completedOrder);

export default router;
