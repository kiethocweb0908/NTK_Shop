import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Cart from "../models/Cart.js";

import * as userService from "../services/userService.js";

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

    const user = await userService.verifyOTP(email, otp);

    if (!process.env.JWT_SECRET)
      throw new Error("Lỗi! JWT_SECRET chưa được định nghĩa");

    const payload = { user: { id: user._id, role: user.role } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "40h",
    });

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

    //Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email không đúng!",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng!" });

    // 🎯 MERGE CARTS TRƯỚC KHI TẠO TOKEN
    const guestId = req.cookies?.guestId;
    let mergedItems = 0;
    let result = {};

    if (guestId) {
      try {
        const mergeResult = await Cart.mergeCarts(guestId, user._id);
        mergedItems = mergeResult.cart ? mergeResult.cart.products.length : 0;
        result = { ...mergeResult };
        res.clearCookie("guestId"); // Xóa guestId sau khi merge
      } catch (mergeError) {
        console.error("Merge cart error:", mergeError);
        // Không throw error để không ảnh hưởng login
      }
    }

    //Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "40h",
    });

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
      result,
    });
  } catch (error) {
    console.error("Lỗi khi gọi loginUser: ", error);
    res.status(500).json("Server Error");
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
