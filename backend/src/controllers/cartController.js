import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @GET /api/cart
// @desc get cart user/guest
// @access Public
export const getCart = async (req, res) => {
  try {
    const cart = req.cart;

    res.json({
      user: cart.user,
      guestId: cart.guestId,
      products: cart.products,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      //   isEmpty: cart.products.length === 0,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCart:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @POST /api/cart
// @desc add product to cart user/guest
// @access Public
export const addProductToCart = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const { validatedProduct, validatedVariant, validatedSize, cart, guestId } =
      req;
    let currentCart = cart;

    // Kiểm tra số lượng tồn kho với số lượng từ req body
    if (validatedSize.countInStock < quantity)
      return res.status(400).json({
        message: `Số lượng trong kho không đủ. ${
          validatedSize.countInStock > 0
            ? `Chỉ còn ${validatedSize.countInStock} sản phẩm.`
            : "Sản phẩm tạm hết hàng!"
        }`,
      });

    // Chưa đăng nhập / guest user
    if (!currentCart) {
      currentCart = new Cart({
        [req.user ? "user" : "guestId"]: req.user ? req.user._id : guestId,
      });
    }

    // tạo cart item
    const cartItem = {
      productId: validatedProduct._id,
      name: validatedProduct.name,
      image: validatedVariant.images[0]?.url || "",
      price: validatedProduct.discountPrice || validatedProduct.price,
      color: validatedVariant.colorName,
      size: validatedSize.name,
      quantity,
    };

    // Sử dụng method trong model
    // await cart.addItem(cartItem);

    try {
      await currentCart.addItem(cartItem);
      //   res.status(200).json({ cart });
    } catch (err) {
      if (err.message === "Sản phẩm đã có trong giỏ hàng") {
        return res.status(400).json({ message: err.message });
      }
      throw err; // để catch ngoài cùng xử lý
    }

    if (currentCart.user) {
      await currentCart.populate("user", "name email");
    }

    res.status(200).json({
      message: "Đã thêm vào giỏ hàng",
      cart: {
        _id: currentCart._id,
        user: currentCart.user,
        guestId: currentCart.guestId,
        totalItems: currentCart.totalItems,
        totalPrice: currentCart.totalPrice,
        products: currentCart.products,
      },
    });
  } catch (error) {
    // if (error.message === "Sản phẩm đã có trong giỏ hàng") {
    //   return res.status(400).json({ message: error.message });
    // }
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @PATCH /api/cart/products
// @desc Update the quantity of products in the shopping cart user/guest
// @access Public
export const updateQuantityOfProductInCart = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { validatedProduct, validatedVariant, validatedSize, cart } = req;

    if (!quantity && quantity !== 0) {
      return res.status(400).json({ message: "Thiếu số lượng!" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }

    // Kiểm tra số lượng tồn kho với số lượng từ req body
    if (validatedSize.countInStock < quantity)
      return res.status(400).json({
        message: `Số lượng trong kho không đủ. ${
          validatedSize.countInStock > 0
            ? `Chỉ còn ${validatedSize.countInStock} sản phẩm.`
            : "Sản phẩm tạm hết hàng!"
        }`,
      });

    // if (req.user) {
    //   cart = await Cart.findOne({ user: req.user._id });
    // } else {
    //   const guestId = req.cookies?.guestId;
    //   if (guestId) cart = await Cart.findOne({ guestId });
    // }

    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });

    await cart.updateQuantity(
      validatedProduct._id,
      validatedVariant.colorName,
      validatedSize.name,
      quantity
    );

    await cart.populate("user", "name email");

    res.json({
      message: "Đã cập nhật giỏ hàng",
      cart: {
        _id: cart._id,
        user: cart.user,
        guestId: cart.guestId,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        products: cart.products,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi updateQuantityOfProductInCart: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @DELETE /api/cart/products
// @desc Remove product from shopping cart user/guest
// @access Public
export const removeProductFromCart = async (req, res) => {
  try {
    const { validatedProduct, validatedVariant, validatedSize, cart } = req;

    if (!cart)
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });

    const deletedProduct = await cart.removeItem(
      validatedProduct._id,
      validatedVariant.colorName,
      validatedSize.name
    );

    await cart.populate("user", "name email");

    res.json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      deletedProduct,
      cart: {
        _id: cart._id,
        user: cart.user,
        guestId: cart.guestId,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        products: cart.products,
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi removeProductFromCart: ", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
