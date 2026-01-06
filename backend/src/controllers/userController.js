import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Cart from "../models/Cart.js";

import * as userService from "../services/userService.js";
import * as authService from "../services/authService.js";

// Helper function to set token cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 40 * 60 * 60 * 1000, // 40 hours
  });
};

// gửi otp khi đăng ký
export const requestRegisterOTP = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    await userService.requestOTP(name, phone, email, password);
    res.json({
      message: "OTP đã được gửi về email của bạn",
    });
  } catch (error) {
    console.error("Lỗi khi gọi requestRegisterOTP:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// xác nhận OTP và tạo user
export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { user, token } = await authService.registerWithOTP(email, otp);

    setTokenCookie(res, token);

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi verifyRegisterOTP:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// gửi lại otp
export const resendRegisterOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await userService.resendOTP(email);

    res.json({ message: "Đã gửi lại mã OTP" });
  } catch (error) {
    console.error("Lỗi khi gọi resendRegisterOTP:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

//Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const guestId = req.cookies?.guestId;

    const { user, token, mergedItems, mergeResult } = await authService.login(
      email,
      password,
      guestId
    );

    if (guestId) res.clearCookie("guestId");

    setTokenCookie(res, token);

    res.json({
      message: "Đăng nhập thành công!",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email,
        role: user.role,
      },
      // token,
      mergedItems,
      result: mergeResult,
    });
  } catch (error) {
    console.error("Lỗi khi gọi loginUser:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

//Get User
export const getUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Lỗi khi gọi getUser: ", error);
    res.status(500).send("Server Error");
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ message: "Đã đăng xuất thành công!" });
  } catch (error) {
    console.error("Lỗi khi gọi logoutUser: ", error);
    res.status(500).send("Server Error");
  }
};

// change information
export const changeInfoUser = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = req.user;

    const updatedUser = await userService.changeInformation(
      name,
      email,
      phone,
      address,
      user
    );

    res.json({
      message: "Thay đổi thông tin thành công!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi gọi changeInfoUser:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await userService.forgotPass(email);

    res.json({
      message: `Đã gửi đặt lại mật khẩu đến ${email}`,
    });
  } catch (error) {
    console.error("Lỗi khi gọi forgotPassword:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    await userService.resetPass(token, password);

    res.json({
      message: "Đặt lại mật khẩu thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi gọi resetPassword:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
