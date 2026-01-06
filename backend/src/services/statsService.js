import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import dayjs from "dayjs";

export const getAdminStats = async (filter) => {
  let startDate = null;

  switch (filter) {
    case "today":
      startDate = dayjs().startOf("day").toDate();
      break;
    case "week":
      startDate = dayjs().startOf("week").toDate();
      break;
    case "month":
      startDate = dayjs().startOf("month").toDate();
      break;
    case "year":
      startDate = dayjs().startOf("year").toDate();
      break;
    default:
      startDate = null;
  }

  const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

  // Tổng số
  const [totalUsers, totalProducts, orders] = await Promise.all([
    User.countDocuments(dateFilter),
    Product.countDocuments(dateFilter),
    Order.find(dateFilter),
  ]);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Biểu đồ doanh thu theo thời gian
  const revenueByDate = {};
  const revenueMap = new Map();
  let format = "DD/MM";
  if (filter === "year") format = "MM/YYYY";
  if (filter === "today") format = "HH:mm";
  orders.forEach((order) => {
    const key = dayjs(order.createdAt).startOf("day").format("YYYY-MM-DD");
    revenueMap.set(key, (revenueMap.get(key) || 0) + order.totalPrice);
  });

  const revenueChart = Array.from(revenueMap.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, revenue]) => ({
      date, // YYYY-MM-DD
      revenue,
    }));

  // Biểu đồ trạng thái đơn hàng
  const orderStatusChart = {};
  orders.forEach((order) => {
    orderStatusChart[order.status] = (orderStatusChart[order.status] || 0) + 1;
  });

  const orderStatusData = Object.entries(orderStatusChart).map(
    ([status, value]) => ({
      name: status,
      value,
    })
  );

  // Biểu đồ sản phẩm theo danh mục
  const categories = await Category.find();

  const productByCategory = await Promise.all(
    categories.map(async (cat) => ({
      name: cat.name,
      value: await Product.countDocuments({ category: cat._id }),
    }))
  );

  return {
    summary: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
    revenueChart,
    orderStatusData,
    productByCategory,
  };
};
