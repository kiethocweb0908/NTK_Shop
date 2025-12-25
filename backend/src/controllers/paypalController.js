import axios from "axios";
import Order from "../models/Order.js";
import { getPayPalAccessToken } from "../services/paypalService.js";
import { sendOrderEmail } from "../utils/email.js";

// tạo đơn hàng Paypal
export const createPayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng theo _id" });
    }
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order._id.toString(),
            amount: {
              currency_code: "USD",
              value: (order.totalPrice / 24000).toFixed(2), // VNĐ → USD
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      paypalOrderId: response.data.id,
      approveUrl: response.data.links.find((link) => link.rel === "approve")
        .href,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Create PayPal order failed" });
  }
};

//
export const capturePayPalOrder = async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng theo _id" });
    }

    if (order.status !== "processing") {
      return res.status(400).json({ message: "Order không còn hợp lệ" });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    await order.markAsPaid();

    await sendOrderEmail(order, "paid");

    res.json({
      message: "Thanh toán Paypal thành công",
      order,
      paypal: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Capture PayPal failed" });
  }
};
