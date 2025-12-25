import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

import * as orderService from "../services/orderService.js";

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json({
      orders,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllOrders: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

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

// @route   GET /api/orders/filter
// @desc    Get orders from filter
// @access  Public
export const getOrdersFromFilter = async (req, res) => {
  try {
    const { phone, email, orderNumber } = req.query;
    // Sử dụng static method để lấy orders

    if (!phone && !email && !orderNumber)
      return res.status(400).json({ message: "Bộ lọc không hợp lệ" });

    const filter = {};
    if (phone) filter.phone = phone;
    if (email) filter.email = email;
    if (orderNumber) filter.orderNumber = orderNumber;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json({
      orders,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getOrdersFromFilter: ", error);
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

// @route   PATCH /api/orders/:id
// @desc    Update order status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { action } = req.body;

    if (!action) return res.status(400).json({ message: "Thiếu hành động" });

    const order = await Order.findById(id);

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const userRole = req?.user?.role;
    const userId = req?.user?._id?.toString();
    const guestId = req?.cookies?.guestId;

    switch (action) {
      case "cancel":
        if (
          userRole !== "admin" &&
          order.user?.toString() !== userId &&
          order.guestId?.toString() !== guestId
        ) {
          return res
            .status(403)
            .json({ message: "Không có quyền huỷ đơn này" });
        }

        if (["shipping", "delivered", "cancelled"].includes(order.status)) {
          return res
            .status(400)
            .json({ message: "Không thể huỷ đơn ở trạng thái này" });
        }

        order.status = "cancelled";
        break;
      case "confirm":
        if (userRole !== "admin")
          return res
            .status(400)
            .json({ message: "không có quyền thực hiện hành động này" });

        if (order.status !== "processing")
          return res
            .status(400)
            .json({ message: "Không thể xác nhận đơn ở trạng thái này" });
        order.status = "confirmed";
        break;
      case "shipping":
        if (userRole !== "admin")
          return res
            .status(400)
            .json({ message: "không có quyền thực hiện hành động này" });

        if (order.status !== "confirmed")
          return res.status(400).json({ message: "Hành động không hợp lệ" });
        order.status = action;
        break;
      case "delivered":
        if (userRole !== "admin")
          return res
            .status(400)
            .json({ message: "không có quyền thực hiện hành động này" });

        if (order.status !== "shipping")
          return res.status(400).json({ message: "Hành động không hợp lệ" });
        order.status = action;
        break;
      default:
        return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    await order.save();
    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
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
