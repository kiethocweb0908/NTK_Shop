import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const validateAndGetCart = async (req, res, next) => {
  try {
    const { productId, color, size } = req.body;

    if (!productId || !color || !size) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm!" });
    }

    let guestId = req.cookies?.guestId;
    if (!req.user && !guestId) {
      guestId = "guest_" + new mongoose.Types.ObjectId().toString();
      res.cookie("guestId", guestId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      req.newGuestId = guestId; // Đánh dấu guestId mới tạo
    }

    // Chạy song song
    const [product, cart] = await Promise.all([
      Product.findById(productId),
      req.user
        ? Cart.findOne({ user: req.user._id })
        : guestId
        ? Cart.findOne({ guestId })
        : Promise.resolve(null),
    ]);

    // kiểm tra product
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    const variant = product.variants.find((v) => v.colorName === color);
    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy màu sắc" });
    }

    const sizeVariant = variant.sizes.find((s) => s.name === size);
    if (!sizeVariant) {
      return res.status(404).json({ message: "Không tìm thấy kích thước" });
    }

    // Kiểm tra cart sau Promise.all
    // if (!cart) {
    //   return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });
    // }

    // Gắn vào request
    req.validatedProduct = product;
    req.validatedVariant = variant;
    req.validatedSize = sizeVariant;
    req.cart = cart;
    req.guestId = guestId;
    next();
  } catch (error) {
    console.error("Lỗi khi gọi validateAndGetCart", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const getCartMiddleware = async (req, res, next) => {
  try {
    let cart;

    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      const guestId = req.cookies?.guestId;
      if (guestId) cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      return res.json({
        products: [],
        totalItems: 0,
        totalPrice: 0,
        isEmpty: true,
      });
    }

    req.cart = cart;
    next();
  } catch (error) {
    console.error("Lỗi khi gọi getCartMiddleware: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
