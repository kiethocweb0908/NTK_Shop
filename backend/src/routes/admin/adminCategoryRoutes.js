import express from "express";
import {
  getAllCategoriesAdmin,
  getCategoryDetails,
  createCategory,
  editCategory,
  toggleActiveCategory,
  deleteCategory,
} from "../../controllers/admin/adminCategoryController.js";
import { authorize, protect } from "../../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../../middlewares/uploadSingleImage.js";

const router = express.Router();

// get all
router.get("/", protect, authorize("admin", "viewer"), getAllCategoriesAdmin);
// get details
router.get(
  "/:categoryId",
  protect,
  authorize("admin", "viewer"),
  getCategoryDetails
);
// create
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadSingleImage,
  createCategory
);
// edit
router.put(
  "/:categoryId/edit",
  protect,
  authorize("admin"),
  uploadSingleImage,
  editCategory
);
// delete
router.delete(
  "/:categoryId/delete",
  protect,
  authorize("admin"),
  deleteCategory
);
// toggle active
router.patch(
  "/:categoryId/toggle-active",
  protect,
  authorize("admin"),
  toggleActiveCategory
);

export default router;
