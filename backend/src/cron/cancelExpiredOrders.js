import cron from "node-cron";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderEmail } from "../utils/email.js";

export const startCancelExpiredOrdersCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Kiểm tra các đơn hàng đã hết hạn...");

      const expiredOrders = await Order.find({
        paymentMethod: { $ne: "cod" },
        isPaid: false,
        status: "processing",
        expiresAt: { $lte: new Date() },
      });

      for (const order of expiredOrders) {
        for (const item of order.orderItems) {
          await Product.updateOne(
            {
              _id: item.productId,
              "variants.colorName": item.color,
              "variants.sizes.name": item.size,
            },
            {
              $inc: {
                "variants.$[variant].sizes.$[size].countInStock": item.quantity,
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

        order.status = "cancelled";
        order.paymentStatus = "failed";
        await order.save();

        await sendOrderEmail(order, "cancelled");

        console.log(`đơn hàng ${order.orderNumber} đã bị huỷ`);
      }
    } catch (error) {
      console.error("Cron cancel order error: ", error);
    }
  });
};
