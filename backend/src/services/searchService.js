import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const searchGlobal = async (q) => {
  const keyword = q.trim();

  const isOrderCode = /^ORD/i.test(keyword);
  const isOnlyNumber = /^\d+$/.test(keyword);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(keyword);

  let orders = [];
  let products = [];
  if (isOrderCode || isOnlyNumber || isEmail) {
    orders = await Order.find({
      $or: [
        { orderNumber: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    })
      .select("_id orderNumber totalPrice orderItems")
      .sort({ createdAt: -1 });

    return {
      type: "orders",
      orders,
    };
  } else {
    products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { slug: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id name price discountPrice variants");

    return {
      type: "products",
      products,
    };
  }
};
