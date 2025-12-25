import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/email.js";
import { generateOTP } from "../utils/generateOTP.js";

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
