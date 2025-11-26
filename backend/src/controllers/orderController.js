import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

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

    const orders = await Order.find({ user: req.user._id });

    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json({
      myOrders: orders,
      totalOrders: orders.length,
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

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.productId", "name");

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

    res.json(order);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private/Public (user hoặc guest)
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, email, paymentMethod, notes } = req.body;

    // 1. Lấy cart hiện tại
    const guestId = req.cookies?.guestId;
    let cart;
    console.log("user", req.user);
    console.log("user", req.user._id);
    if (req.user) {
      cart = await Cart.findOne({ user: req.user?._id });
    } else {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        message: "Giỏ hàng trống",
      });
    }

    // 2. Tạo order object
    const order = new Order({
      user: req.user?._id,
      guestId: guestId,
      orderItems: cart.products,
      shippingAddress,
      phone,
      email,
      paymentMethod: paymentMethod || "cod",
      notes,
    });

    // 3. Kiểm tra tồn kho trước khi tạo order
    const stockIssues = await order.checkStock();
    if (stockIssues.length > 0) {
      return res.status(400).json({
        message: "Một số sản phẩm không đủ tồn kho",
        errors: stockIssues,
      });
    }

    // 4. Lưu order (tự động chạy middleware tính toán)
    const createdOrder = await order.save();

    // 5. Cập nhật tồn kho sản phẩm
    for (const item of createdOrder.orderItems) {
      await Product.updateOne(
        {
          _id: item.productId,
          "variants.colorName": item.color,
          "variants.sizes.name": item.size,
        },
        {
          $inc: {
            "variants.$[variant].sizes.$[size].countInStock": -item.quantity,
          },
        },
        {
          arrayFilters: [
            { "variant.colorName": item.color },
            { "size.name": item.size },
          ],
        }
      );
    }

    // 6. Xóa cart sau khi tạo order thành công
    await Cart.findByIdAndDelete(cart._id);

    // 7. Trả về order đã tạo
    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Lỗi khi gọi createOrder: ", error);
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
