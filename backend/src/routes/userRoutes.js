import express from "express";
import {
  loginUser,
  getUser,
  logoutUser,
  requestRegisterOTP,
  verifyRegisterOTP,
  resendRegisterOTP,
  changeInfoUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, getUser);
router.post("/logout", logoutUser);

// gửi OTP
router.post("/request-otp", requestRegisterOTP);
// Xác thực OTP
router.post("/verify-otp", verifyRegisterOTP);
// gửi lại OTP
router.post("/resend-otp", resendRegisterOTP);
// đổi thông tin
router.patch("/:email/change-infomation", protect, changeInfoUser);

// quên mật khẩu
router.post(`/forgot-password`, forgotPassword);
// đặt lại mật khẩu
router.post(`/reset-password`, resetPassword);

// module.exports = router;
export default router;
