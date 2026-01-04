import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderEmail } from "../utils/email.js";

// helper function
const getCurrentCart = async (user, guestId) => {
  let cart;

  if (user) {
    cart = await Cart.findOne({ user: user?._id });
  } else {
    cart = await Cart.findOne({ guestId });
  }

  if (!cart || cart.products.length === 0) {
    throw new Error("Lỗi! Giỏ hàng trống");
  }

  return cart;
};

// find order by id
const findOrderById = async (orderId) => {
  if (!orderId) throw new Error("Lỗi! không nhận được _id");
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Lỗi! không tìm thấy đơn hàng từ _id");
  return order;
};

export const createOrderr = async (
  user,
  guestId,
  name,
  phone,
  email,
  shippingAddress,
  shippingPrice,
  paymentMethod,
  notes
) => {
  // Lấy giỏ hàng hiện tại
  const cart = await getCurrentCart(user, guestId);

  // tạo order
  const order = new Order({
    user: user?._id,
    guestId,
    name,
    phone,
    email,
    orderItems: cart.products,
    shippingPrice,
    shippingAddress: {
      fullAddress: shippingAddress.fullAddress,
      province: shippingAddress.province,
      district: shippingAddress.district,
      ward: shippingAddress.ward,
    },
    paymentMethod: paymentMethod || "cod",
    notes,
  });

  if (paymentMethod !== "cod") {
    order.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
  }

  // Kiểm tra tồn kho trước khi tạo order
  const stockIssues = await order.checkStock();
  if (stockIssues.length > 0) {
    throw new Error(stockIssues.join(", "));
  }

  // thời gian tồn tại của thanh toán onl
  if (paymentMethod !== "cod") {
    order.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  }

  // tạo đơn
  await order.validate();
  const createdOrder = await order.save();

  // cập nhật tồn kho sản phẩm
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
  // xoá cart sau khi tạo đơn hàng
  await Cart.findByIdAndDelete(cart._id);

  // gửi đơn hàng về mail
  await sendOrderEmail(order, "created");

  return createdOrder;
};

// huỷ
export const Cancel = async (orderId, user, guestId) => {
  const order = await findOrderById(orderId);

  if (user) {
    if (!order.user.equals(user._id)) {
      throw new Error("Lỗi! Đơn hàng này không phải của bạn!");
    }
  } else {
    if (!order.guestId || !order.guestId.equals(guestId)) {
      throw new Error("Lỗi! Đơn hàng này không phải của bạn!");
    }
  }

  if (order.status !== "processing")
    throw new Error("Lỗi! không thể huỷ đơn ở trạng thái này");

  order.status = "cancelled";
  order.expiresAt = undefined;
  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
    order.isPaid = false;
  }

  const bulkOps = order.orderItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.productId,
        "variants.colorName": item.color,
        "variants.sizes.name": item.size,
      },
      update: {
        $inc: {
          "variants.$[variant].sizes.$[size].countInStock": item.quantity,
        },
      },
      arrayFilters: [
        { "variant.colorName": item.color },
        { "size.name": item.size },
      ],
    },
  }));

  await Product.bulkWrite(bulkOps);

  await order.validate();
  const CancelleddOrder = await order.save();

  await sendOrderEmail(order, "cancelled");

  return CancelleddOrder;
};

// đã giao
export const completed = async (orderId, user, guestId) => {
  const order = await findOrderById(orderId);
  console.log("user: ", user?._id);
  console.log("guestId: ", guestId);
  console.log("order user: ", order?.user);
  console.log("order guestId: ", order?.guestId);

  if (user) {
    if (!order.user.equals(user._id)) {
      throw new Error("Lỗi! Đơn hàng này không phải của bạn!");
    }
  } else {
    if (!order.guestId || !order.guestId.equals(guestId)) {
      throw new Error("Lỗi! Đơn hàng này không phải của bạn!");
    }
  }

  if (order.status !== "delivered")
    throw new Error("Lỗi! không thể nhận hàng ở trạng thái này");

  order.status = "completed";
  // order.isPaid = true;
  // order.paidAt = new Date();
  // order.paymentStatus = "paid";

  const bulkOps = order.orderItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.productId,
      },
      update: {
        $inc: {
          quantitySold: item.quantity,
        },
      },
    },
  }));

  await Product.bulkWrite(bulkOps);

  await order.validate();
  const deliveredOrder = await order.save();

  return deliveredOrder;
};

//==========ADMIN================

// update order status admin
export const updateStatus = async (orderId) => {
  const order = await findOrderById(orderId);

  let message;
  switch (order.status) {
    case "processing":
      message = `Đơn hàng ${order.orderNumber} đã được xác nhận`;
      order.status = "confirmed";
      break;
    case "confirmed":
      message = `Đơn hàng ${order.orderNumber} đã được vận chuyển`;
      order.status = "shipping";
      order.shippingAt = new Date();
      break;
  }

  await order.validate();
  const updatedOrder = await order.save();

  return { updatedOrder, message };
};
