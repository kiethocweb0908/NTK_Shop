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
import { authorize, protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Get
router.get("/", protect, authorize("admin", "viewer"), getAdminProducts);
router.get(
  "/:productId",
  protect,
  authorize("admin", "viewer"),
  getProductDetails
);

// Create
router.post("/", protect, authorize("admin"), createProduct);

// Delete
router.delete("/:productId", protect, authorize("admin"), deleteProduct);

// Cập nhật trường cơ bản
router.patch(
  "/:productId/updateBasicFields",
  protect,
  authorize("admin"),
  updateBasicFieldsProduct
);

// cập nhật số lượng tồn của biến thể
router.patch(
  "/:productId/variants/:variantId/countInStock",
  protect,
  authorize("admin"),
  updateCountInStockProduct
);

// thêm size cho biến thể
router.patch(
  "/:productId/variants/:variantId/addSizes",
  protect,
  authorize("admin"),
  addSizesVariant
);

// xoá size của biến thể
router.patch(
  "/:productId/variants/:variantId/deleteSizes",
  protect,
  authorize("admin"),
  deleteSizesVariant
);

// đổi màu sắc
router.patch(
  "/:productId/variants/:variantId/updateColor",
  protect,
  authorize("admin"),
  updateColoVariants
);

// thêm ảnh
router.patch(
  "/:productId/variants/:variantId/addImages",
  protect,
  authorize("admin"),
  addImagesVariant
);

// Xoá ảnh
router.patch(
  "/:productId/variants/:variantId/removeImages",
  protect,
  authorize("admin"),
  removeImagesVariant
);

// thêm biến thể
router.post(
  "/:productId/variants",
  protect,
  authorize("admin"),
  addProductVariants
);

// xoá biến thể
router.delete(
  "/:productId/variants",
  protect,
  authorize("admin"),
  removeProductVariants
);

// Thay đổi trạng thái hiện/ẩn
router.patch(
  "/isPublished",
  protect,
  authorize("admin"),
  toggleProductPublished
);
router.patch(
  "/:id/isFeatured",
  protect,
  authorize("admin"),
  toggleProductFeatured
);

export default router;
