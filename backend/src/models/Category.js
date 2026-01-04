import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageSizeMen: {
      url: {
        type: String,
      },
      altText: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    imageSizeWomen: {
      url: {
        type: String,
      },
      altText: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    metaTitle: String,
    metaDescription: String,
    // Có thể thêm: parentCategory cho categories đa cấp
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

// Tạo slug tự động trước khi save
categorySchema.pre("save", function (next) {
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

const Category = mongoose.model("Category", categorySchema);
export default Category;
