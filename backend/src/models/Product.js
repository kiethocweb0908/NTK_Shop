import mongoose from "mongoose";

// Định nghĩa sub-schema cho Kích thước và Tồn kho
const sizeVariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "2XL"], // Tên kích thước
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Đảm bảo tồn kho không âm
    },
  },
  { _id: false } // Không cần ID cho mỗi kích thước
);

// Định nghĩa sub-schema cho Hình ảnh
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
    },
    publicId: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Định nghĩa sub-schema cho Biến thể Màu (Color Variant)
const colorVariantSchema = new mongoose.Schema(
  {
    colorName: {
      // Tên màu (ví dụ: "Đỏ Tía")
      type: String,
      required: true,
      trim: true,
    },
    colorSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    colorHex: {
      // Mã Hex màu (ví dụ: "#800080")
      type: String,
      trim: true,
    },
    sizes: [sizeVariantSchema], // Mảng các kích thước và tồn kho
    images: [imageSchema], // Mảng các hình ảnh cho màu này
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          // Discount price phải nhỏ hơn hoặc bằng price
          return value <= this.price;
        },
        message: "Giá khuyến mãi không được lớn hơn giá gốc",
      },
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    variants: {
      type: [colorVariantSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Sản phẩm phải có ít nhất một biến thể màu (variant).",
      },
    },
    productCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: false,
    },
    material: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      default: "Unisex",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: Number,
  },
  { timestamps: true }
);

// === PRE-HOOK === (Tự động tạo slug cho Product)
productSchema.pre("save", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  next();
});

// === INDEXES === (Thêm tốc độ tìm kiếm)
// productSchema.index({ slug: 1 });
productSchema.index({ name: "text" });
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ "variants.colorName": 1 });
productSchema.index({ price: 1 });

// === VIRTUALS === (Thêm thuộc tính ảo) discount %
productSchema.virtual("discountPercentage").get(function () {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// isOnSale
productSchema.virtual("isOnSale").get(function () {
  return !!this.discountPrice && this.discountPrice < this.price;
});

// === METHODS === (Thêm hàm cho product) stock check
productSchema.methods.hasStock = function (colorName, sizeName) {
  const variant = this.variants.find((v) => v.colorName === colorName);
  if (!variant) return false;

  const size = variant.sizes.find((s) => s.name === sizeName);
  return size ? size.countInStock > 0 : false;
};

//lấy tổng stock
productSchema.methods.getTotalStock = function () {
  return this.variants.reduce((total, variant) => {
    return (
      total + variant.sizes.reduce((sum, size) => sum + size.countInStock, 0)
    );
  }, 0);
};

const Product = mongoose.model("Product", productSchema);
export default Product;
