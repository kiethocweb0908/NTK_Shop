import nodemailer from "nodemailer";
import { transporter } from "../config/mail.js";

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `NTK Shop <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã xác thực OTP",
    html: `
      <h2>Mã OTP của bạn</h2>
      <p><b>${otp}</b></p>
      <p>Mã có hiệu lực trong 5 phút</p>
    `,
  });
};

export const sendOrderEmail = async (order, type = "created") => {
  let subject = "";
  let html = "";

  if (type === "created") {
    subject = `Xác nhận đơn hàng #${order.orderNumber}`;
    html = `
      <h2>Cảm ơn bạn đã đặt hàng!</h2>
      <p>Mã đơn hàng: <b>${order.orderNumber}</b></p>
      <p>Phương thức thanh toán: ${order.paymentMethod}</p>
      <p>Tổng tiền: ${order.totalPrice.toLocaleString()}đ</p>
    `;
  }

  if (type === "paid") {
    subject = `Thanh toán thành công - #${order.orderNumber}`;
    html = `
      <h2>Thanh toán thành công 🎉</h2>
      <p>Đơn hàng <b>${order.orderNumber}</b> đã được thanh toán.</p>
    `;
  }

  if (type === "cancelled") {
    subject = `Đơn hàng đã bị huỷ - #${order.orderNumber}`;
    html = `
      <h2>Đơn hàng đã bị huỷ</h2>
      <p>Đơn hàng <b>${order.orderNumber}</b> đã bị huỷ do chưa thanh toán.</p>
    `;
  }

  await transporter.sendMail({
    from: `NTK Shop <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject,
    html,
  });
};
