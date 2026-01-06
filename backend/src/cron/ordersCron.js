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
                quantitySold: -item.quantity,
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

export const deliveredCron = () => {
  cron.schedule("*/8 * * * *", async () => {
    try {
      console.log("Kiểm tra các đơn hàng đã giao...");

      const threeDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      const orders = await Order.find({
        status: "shipping",
        shippingAt: { $lte: threeDaysAgo },
      });

      if (!orders.length) return;

      await Order.updateMany(
        {
          _id: { $in: orders.map((o) => o._id) },
        },
        {
          $set: {
            status: "delivered",
            deliveredAt: new Date(),
            isPaid: true,
            paymentStatus: "paid",
          },
        }
      );
      console.log(`[CRON] Auto delivered: ${orders.length} orders`);
    } catch (err) {
      console.error("[CRON] Auto delivered error:", err);
    }
  });
};

export const completedOrderCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("Kiểm tra các đơn hàng cần hoàn thành...");
      const threeDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      const orders = await Order.find({
        status: "delivered",
        deliveredAt: { $lte: threeDaysAgo },
      });

      if (!orders.length) return;

      // 👉 build bulk update product
      const productBulkOps = [];

      for (const order of orders) {
        for (const item of order.orderItems) {
          productBulkOps.push({
            updateOne: {
              filter: { _id: item.productId },
              update: {
                $inc: { quantitySold: item.quantity },
              },
            },
          });
        }
      }

      if (productBulkOps.length) {
        await Product.bulkWrite(productBulkOps);
      }

      await Order.updateMany(
        { _id: { $in: orders.map((o) => o._id) } },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        }
      );

      console.log(`[CRON] Auto completed: ${orders.length} orders`);
    } catch (err) {
      console.error("[CRON] Auto completed error:", err);
    }
  });
};
