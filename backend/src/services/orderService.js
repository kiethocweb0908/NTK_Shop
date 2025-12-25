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
