import mongoose from "mongoose";
import Cart from "../models/Cart.js";

export const resolveCart = async (req, res, next) => {
  try {
    let guestId = req.cookies?.guestId;

    if (!req.user && !guestId) {
      guestId = "guest_" + new mongoose.Types.ObjectId().toString();
      res.cookie("guestId", guestId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
    }

    let cart = null;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    req.cart = cart;
    req.guestId = guestId;

    next();
  } catch (err) {
    console.error("resolveCart error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
