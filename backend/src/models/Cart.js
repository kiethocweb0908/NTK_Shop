import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // variantSlug: {
    //   type: String,
    //   required: true,
    // },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
      required: true,
    },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "2XL"],
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      trim: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Số lượng phải là số nguyên",
      },
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    guestId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    products: {
      type: [cartItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalItems: {
      // 🎯 THÊM: Tổng số sản phẩm
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

//  MIDDLEWARE TỰ ĐỘNG TÍNH TOÁN
cartSchema.pre("save", function (next) {
  this.totalItems = this.products.reduce(
    (total, item) => total + item.quantity,
    0
  );
  this.totalPrice = this.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

// 🎯 METHODS TIỆN ÍCH
cartSchema.methods.addItem = function (cartItem) {
  const existingItem = this.products.find(
    (p) =>
      p.productId.equals(cartItem.productId) &&
      p.color === cartItem.color &&
      p.size === cartItem.size
  );

  if (existingItem) {
    throw new Error("Sản phẩm đã có trong giỏ hàng");
  } else {
    this.products.push(cartItem);
  }

  return this.save();
};

cartSchema.methods.updateQuantity = function (
  productId,
  color,
  size,
  newQuantity
) {
  const item = this.products.find(
    (p) => p.productId.equals(productId) && p.color === color && p.size === size
  );

  if (item) {
    item.quantity = newQuantity;
    return this.save();
  }

  throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
};

cartSchema.methods.removeItem = function (productId, color, size) {
  const itemIndex = this.products.findIndex(
    (p) => p.productId.equals(productId) && p.color === color && p.size === size
  );

  if (itemIndex === -1) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  const deletedItem = { ...this.products[itemIndex].toObject() };
  this.products.splice(itemIndex, 1);

  return this.save().then(() => deletedItem);
};

// 🎯 VIRTUALS
cartSchema.virtual("isEmpty").get(function () {
  return this.products.length === 0;
});

// 🎯 STATIC METHODS
cartSchema.statics.findByUser = function (userId) {
  return this.findOne({ user: userId });
};

cartSchema.statics.findByGuest = function (guestId) {
  return this.findOne({ guestId });
};

cartSchema.statics.mergeCarts = async function (guestCartId, userId) {
  // 1. Tìm guest cart (khách vãng lai)
  const guestCart = await this.findOne({ guestId: guestCartId });

  // 2. Tìm user cart (user đã login)
  const userCart = await this.findOne({ user: userId });

  if (!guestCart)
    return {
      message: "không có guest cart",
      mergedCount: 0,
      skippedCount: 0,
      cart: userCart,
    }; // Không có guest cart → return user cart

  if (userCart) {
    let mergedCount = 0;
    let skippedCount = 0;
    const result = {
      merged: [],
      skipped: [],
    };

    // 🎯 TRƯỜNG HỢP 1: User ĐÃ có cart → MERGE
    for (const guestItem of guestCart.products) {
      // Kiểm tra xem item đã có trong user cart chưa
      const existingItem = userCart.products.find(
        (userItem) =>
          userItem.productId.equals(guestItem.productId) &&
          userItem.color === guestItem.color &&
          userItem.size === guestItem.size
      );

      if (!existingItem) {
        // 🎯 Nếu chưa có: THÊM MỚI
        userCart.products.push(guestItem);
        mergedCount++;
        result.merged.push(guestItem);
      } else {
        // 🎯 Nếu đã có: BỎ QUA
        skippedCount++;
        result.skipped.push(existingItem);
      }
    }

    await guestCart.deleteOne(); // Xóa guest cart
    const updatedCart = await userCart.save();

    return {
      message: "merge guest cart vào user cart",
      mergedCount,
      skippedCount,
      result,
      cart: updatedCart,
    };
  } else {
    // 🎯 TRƯỜNG HỢP 2: User CHƯA có cart → CONVERT
    guestCart.user = userId; // Gán user ID
    guestCart.guestId = undefined; // Xóa guest ID
    const convertedCart = await guestCart.save();
    return {
      message: "Tạo user cart và merge",
      mergedCount: guestCart.products.length,
      cart: convertedCart,
    }; // Lưu thành user cart
  }
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
