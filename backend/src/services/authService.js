import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import * as userService from "./userService.js";

// hepler function

const createToken = (user) => {
  if (!process.env.JWT_SECRET)
    throw new Error("Lỗi! JWT_SECRET chưa được định nghĩa");

  const payload = { user: { id: user._id, role: user.role } };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "40h",
  });

  return token;
};

//======================================

// login
export const login = async (email, password, guestId) => {
  // 1. Check user
  const user = await User.findOne({ email });
  if (!user) throw new Error("Lỗi! Email không đúng!");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Lỗi! Mật khẩu không đúng!");

  // 2. Merge cart (nếu có guestId)
  let mergedItems = 0;
  let mergeResult = null;

  if (guestId) {
    try {
      mergeResult = await Cart.mergeCarts(guestId, user._id);
      mergedItems = mergeResult?.cart?.products?.length || 0;
    } catch (err) {
      console.error("Lỗi! Merge cart error:", err);
    }
  }

  // 3. Create JWT
  const token = createToken(user);

  return {
    user,
    token,
    mergedItems,
    mergeResult,
  };
};

// register
export const registerWithOTP = async (email, otp) => {
  const user = await userService.verifyOTP(email, otp);

  const token = createToken(user);

  return { user, token };
};
