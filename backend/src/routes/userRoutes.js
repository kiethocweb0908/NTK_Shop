import express from "express";
import {
  loginUser,
  getUser,
  logoutUser,
  requestRegisterOTP,
  verifyRegisterOTP,
  resendRegisterOTP,
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

// module.exports = router;
export default router;
