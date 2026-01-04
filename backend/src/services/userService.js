import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOTPEmail, sendUrlResetPassword } from "../utils/email.js";
import { generateOTP } from "../utils/generateOTP.js";
import crypto from "crypto";

// gửi OTP
export const requestOTP = async (name, phone, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email đã tồn tại");

  const otp = generateOTP();

  await Otp.findOneAndUpdate(
    { email },
    {
      email,
      otp,
      name,
      phone,
      password,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
    { upsert: true, new: true }
  );

  await sendOTPEmail(email, otp);
};

// xác nhận OTP & tạo user
export const verifyOTP = async (email, otp) => {
  const otpRecord = await Otp.findOne({ email });

  if (!otpRecord) throw new Error("Lỗi! OTP không tồn tại");

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({ email });
    throw new Error("OTP đã hết hạn");
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email });
      throw new Error("Nhập sai OTP quá nhiều lần");
    }

    throw new Error("OTP không đúng");
  }

  const user = new User({
    name: otpRecord.name,
    phone: otpRecord.phone,
    email: otpRecord.email,
    password: otpRecord.password,
  });
  await user.validate();
  await user.save();

  await Otp.deleteOne({ email });

  return user;
};

// gửi lại OTP
export const resendOTP = async (email) => {
  const otpRecord = await Otp.findOne({ email });

  if (!otpRecord) throw new Error("Lỗi! Không tìm thấy yêu cầu đăng ký");

  // optional: chống spam
  if (otpRecord.attempts >= 5)
    throw new Error("Lỗi! Gửi OTP quá nhiều lần, vui lòng thử lại sau");

  const otp = generateOTP();

  otpRecord.otp = otp;
  otpRecord.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  otpRecord.attempts = 0;

  await otpRecord.save();
  await sendOTPEmail(email, otp);
};

// change info
export const changeInformation = async (name, email, phone, address, user) => {
  if (!user) throw new Error("Lỗi! không có user");
  if (!user) throw new Error("Lỗi! không có email");
  if (!name) throw new Error("Lỗi! không có name");
  if (!phone) throw new Error("Lỗi! không có phone");
  if (typeof address !== "object") throw new Error("Lỗi! địa chỉ không hợp lệ");
  if (
    !address?.fullAddress ||
    !address?.province ||
    !address?.district ||
    !address?.ward
  )
    throw new Error("Lỗi! Thiếu thông tin địa chỉ");

  const currentUser = await User.findOne({ email }).select("-password");
  if (!currentUser) throw new Error("Lỗi! không tìm thấy user hiện tại");
  if (!currentUser._id.equals(user._id))
    throw new Error("Lỗi! Đây không phải tài khoản của bạn");

  currentUser.name = name;
  currentUser.phone = phone;
  currentUser.address.fullAddress = address.fullAddress;
  currentUser.address.city = address.province;
  currentUser.address.district = address.district;
  currentUser.address.ward = address.ward;

  await currentUser.validate();
  const updatedUser = await currentUser.save();
  updatedUser.password = undefined;
  return updatedUser;
};

// forgot password
export const forgotPass = async (email) => {
  if (!email) throw new Error("Lỗi! không nhận được email");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Lỗi! email này chưa được đăng ký");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hasdedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hasdedToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await sendUrlResetPassword(user.email, resetUrl);
};

// reset password
export const resetPass = async (token, password) => {
  if (!password) throw new Error("Lỗ! thiếu password");
  if (!token) throw new Error("Lỗ! thiếu token");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Lỗi! Token không hợp lệ hoặc hết hạn");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
};
