import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import * as cartService from "../services/cartService.js";

export const getCart = async (req, res) => {
  try {
    const cart = req.cart;

    if (!cart) {
      return res.json({
        cart: null,
        messages: [],
      });
    }

    const result = await cartService.validateCart(cart);

    res.json({
      message: "Lấy giỏ hàng thành công!",
      ...result,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    const { productId, color, size, quantity = 1 } = req.body;

    const cart = await cartService.addToCart({
      cart: req.cart,
      user: req.user,
      guestId: req.guestId,
      productId,
      color,
      size,
      quantity,
    });

    res.json({
      message: "Đã thêm vào giỏ hàng",
      cart,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { productId, color, size, quantity } = req.body;

    const cart = await cartService.updateCartItemQuantity({
      cart: req.cart,
      productId,
      color,
      size,
      quantity,
    });

    await cart.populate("user", "name email");

    res.json({
      message: "Đã cập nhật số lượng!",
      cart,
    });
  } catch (error) {
    console.error("Lỗi khi gọi updateQuantity:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { productId, color, size } = req.body;

    const { cart, deletedProduct } = await cartService.removeCartItem({
      cart: req.cart,
      productId,
      color,
      size,
    });

    await cart.populate("user", "name email");

    res.json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      deletedProduct,
      cart,
    });
  } catch (error) {
    console.error("Lỗi khi gọi removeItem:", error);
    const status = error.message.includes("Lỗi!") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};
