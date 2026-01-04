import Order from "../../models/Order.js";
import * as orderService from "../../services/orderService.js";

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      paymentMethod,
      time,
      search,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const matchStage = {};

    // Lọc theo trạng thái đơn hàng
    if (status && status !== "all") matchStage.status = status;

    // Lọc theo trạng thái thanh toán
    if (paymentStatus && paymentStatus !== "all")
      matchStage.paymentStatus = paymentStatus;

    if (paymentMethod && paymentMethod !== "all")
      matchStage.paymentMethod = paymentMethod;

    // Lọc theo thời gian
    if (time && time !== "all") {
      const now = new Date();
      let startDate;

      switch (time) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;

        case "week":
          startDate = new Date();
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;

        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;

        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;

        default:
          break;
      }

      if (startDate) matchStage.createdAt = { $gte: startDate };
    }

    // Tìm theo _id / orderNumber / email / phone
    if (search && search !== "") {
      matchStage.$or = [
        { _id: { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // AGGREGATION PIPELINE
    const result = await Order.aggregate([
      { $match: matchStage },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNumber }],
          metadata: [{ $count: "totalOrders" }],
        },
      },
    ]);

    const orders = result[0].data;
    const totalOrders = result[0].metadata[0]?.totalOrders || 0;
    const totalPages = Math.ceil(totalOrders / limitNumber);

    res.json({
      message: "Lấy danh sách đơn hàng thành công",
      orders,
      pagination: {
        totalOrders,
        currentPage: pageNumber,
        totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAllOrdersAdmin: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// xem chi tiết
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
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

// update status
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { updatedOrder, message } = await orderService.updateStatus(orderId);

    res.json({
      message,
      updatedOrder,
    });
  } catch (error) {
    console.error("Lỗi khi gọi cancelOrder:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
