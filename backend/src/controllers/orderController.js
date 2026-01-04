import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

import * as orderService from "../services/orderService.js";

// @route   GET /api/orders/my-orders
// @desc    Get orders of user
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    if (!req.user)
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments({ user: req.user._id });

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      message: "Lấy danh sách đơn hàng thành công!",
      myOrders: orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi getMyOrders: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private/Public
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    // .populate("user", "name email phone address")
    // .populate("orderItems.productId", "name");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền truy cập
    const isOwner =
      (req.user && order.user?._id.toString() === req.user._id.toString()) ||
      (!req.user && order.guestId === req.cookies?.guestId) ||
      (req.user && req.user.role === "admin");

    if (!isOwner) {
      return res.status(403).json({
        message: "Không có quyền truy cập đơn hàng này",
      });
    }

    res.json({
      message: "Lấy chi tiết đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// tạo đơn hàng
export const placeOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      shippingAddress,
      shippingPrice,
      paymentMethod,
      notes,
    } = req.body;

    const user = req.user;
    const guestId = req.cookies?.guestId;

    const createdOrder = await orderService.createOrderr(
      user,
      guestId,
      name,
      phone,
      email,
      shippingAddress,
      shippingPrice,
      paymentMethod,
      notes
    );

    res.status(201).json({
      message: "Đặt hàng thành công!",
      createdOrder,
    });
  } catch (error) {
    console.error("Lỗi khi gọi placeOrder:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// Huỷ đơn hàng
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const user = req.user;
    const guestId = req.cookies?.guestId;

    const CancelleddOrder = await orderService.Cancel(orderId, user, guestId);

    res.json({
      message: "Huỷ đơn thành công!",
      CancelleddOrder,
    });
  } catch (error) {
    console.error("Lỗi khi gọi cancelOrder:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// đã nhận hàng
export const completedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const user = req.user;
    const guestId = req.cookies?.guestId;

    const deliveredOrder = await orderService.completed(orderId, user, guestId);

    res.json({
      message: "Nhận hàng thành công!",
      order: deliveredOrder,
    });
  } catch (error) {
    console.error("Lỗi khi gọi deliveredOrder:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
