import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    price: {
      type: Number,
      min: 0,
      required: true,
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

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
      trim: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => {
        const date = new Date();
        const timestamp = date.getTime();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
      },
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "vnpay", "banking"],
      default: "cod",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["processing", "confirmed", "shipping", "delivered", "cancelled"],
      default: "processing",
    },
    totalItems: {
      // 🎯 THÊM: Tổng số sản phẩm
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    notes: {
      // ✅ THÊM: Ghi chú đơn hàng
      type: String,
    },
  },
  { timestamps: true }
);

//  MIDDLEWARE TỰ ĐỘNG TÍNH TOÁN
orderSchema.pre("save", async function (next) {
  this.totalItems = this.orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  this.shippingPrice = this.totalPrice >= 1000000 ? 0 : 30000;

  this.totalPrice = this.shippingPrice + this.totalPriceItem;

  this.isPaid = this.paymentMethod !== "cod";

  this.paymentStatus = this.isPaid ? "paid" : "pending";

  // Tự động tạo orderNumber
  //   if (!this.orderNumber) {
  //     const date = new Date();
  //     const timestamp = date.getTime();
  //     const random = Math.floor(Math.random() * 1000);
  //     this.orderNumber = `ORD-${timestamp}-${random}`;
  //   }

  next();
});

// VIRTUALS
orderSchema.virtual("totalPriceItem").get(function () {
  return this.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

orderSchema.virtual("canCancel").get(function () {
  return ["processing", "confirmed"].includes(this.status);
});

orderSchema.virtual("canUpdate").get(function () {
  return this.status === "processing";
});

// ==================== METHODS ====================
orderSchema.methods.updateStatus = function (newStatus) {
  const allowedStatuses = [
    "processing",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  this.status = newStatus;

  if (newStatus === "delivered") {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }

  if (newStatus === "cancelled") {
    this.paymentStatus = "refunded";
  }

  return this.save();
};

orderSchema.methods.markAsPaid = function (paymentData = {}) {
  this.isPaid = true;
  this.paidAt = new Date();
  this.paymentStatus = "paid";
  return this.save();
};

orderSchema.methods.checkStock = async function () {
  const Product = mongoose.model("Product");
  const stockIssues = [];

  for (const item of this.orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      stockIssues.push(`Sản phẩm "${item.name}" không tồn tại`);
      continue;
    }

    const variant = product.variants.find((v) => v.colorName === item.color);
    if (!variant) {
      stockIssues.push(`Màu "${item.color}" không tồn tại cho "${item.name}"`);
      continue;
    }

    const sizeVariant = variant.sizes.find((s) => s.name === item.size);
    if (!sizeVariant || sizeVariant.countInStock < item.quantity) {
      const availableStock = sizeVariant?.countInStock || 0;
      stockIssues.push(
        `"${item.name} - ${item.color} - ${item.size}": Chỉ còn ${availableStock} sản phẩm`
      );
    }
  }

  return stockIssues;
};

// ==================== STATICS ====================
orderSchema.statics.findByUserOrGuest = function (user, guestId) {
  if (user) {
    return this.find({ user: user._id }).sort({ createdAt: -1 });
  } else if (guestId) {
    return this.find({ guestId }).sort({ createdAt: -1 });
  }
  return [];
};

orderSchema.statics.getOrderStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  return stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
};

orderSchema.statics.getOrdersByStatus = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
