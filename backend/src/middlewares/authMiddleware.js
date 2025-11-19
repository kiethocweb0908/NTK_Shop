import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Không có token, truy cập bị từ chối",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.user.id).select("-password");

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // res.status(401).json({ message: "Token không hợp lệ" });
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }

    res.status(500).json({ message: "Lỗi server" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Cho phép đi tiếp
  } else {
    res.status(403).json({
      message: "Truy cập bị từ chối. Yêu cầu quyền admin.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token nếu có
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user từ token
      req.user = await User.findById(decoded.user.id).select("-password");
    }

    // Nếu không có token, vẫn cho đi tiếp (req.user sẽ là undefined)
    next();
  } catch (error) {
    // Nếu token không hợp lệ, vẫn cho đi tiếp (không throw error)
    console.error("Optional auth error:", error);
    next();
  }
};
