import express from "express";

import {
  getAdminProducts,
  getProductDetails,
  createProduct,
  toggleProductPublished,
  toggleProductFeatured,
  deleteProduct,
  updateBasicFieldsProduct,
  updateCountInStockProduct,
  addSizesVariant,
  deleteSizesVariant,
  updateColoVariants,
  addImagesVariant,
  removeImagesVariant,
  addProductVariants,
  removeProductVariants,
} from "../../controllers/admin/adminProductController.js";
import { admin, protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Get
router.get("/", protect, admin, getAdminProducts);
router.get("/:productId", protect, admin, getProductDetails);

// Create
router.post("/", protect, admin, createProduct);

// Delete
router.delete("/:productId", protect, admin, deleteProduct);

// Cập nhật trường cơ bản
router.patch(
  "/:productId/updateBasicFields",
  protect,
  admin,
  updateBasicFieldsProduct
);

// cập nhật số lượng tồn của biến thể
router.patch(
  "/:productId/variants/:variantId/countInStock",
  protect,
  admin,
  updateCountInStockProduct
);

// thêm size cho biến thể
router.patch(
  "/:productId/variants/:variantId/addSizes",
  protect,
  admin,
  addSizesVariant
);

// xoá size của biến thể
router.patch(
  "/:productId/variants/:variantId/deleteSizes",
  protect,
  admin,
  deleteSizesVariant
);

// đổi màu sắc
router.patch(
  "/:productId/variants/:variantId/updateColor",
  protect,
  admin,
  updateColoVariants
);

// thêm ảnh
router.patch(
  "/:productId/variants/:variantId/addImages",
  protect,
  admin,
  addImagesVariant
);

// Xoá ảnh
router.patch(
  "/:productId/variants/:variantId/removeImages",
  protect,
  admin,
  removeImagesVariant
);

// thêm biến thể
router.post("/:productId/variants", protect, admin, addProductVariants);

// xoá biến thể
router.delete("/:productId/variants", protect, admin, removeProductVariants);

// Thay đổi trạng thái hiện/ẩn
router.patch("/isPublished", protect, admin, toggleProductPublished);
router.patch("/:id/isFeatured", protect, admin, toggleProductFeatured);

export default router;
