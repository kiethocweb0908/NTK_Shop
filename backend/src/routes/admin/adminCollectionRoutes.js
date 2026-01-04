import express from "express";

import { authorize, protect } from "../../middlewares/authMiddleware.js";
import {
  getAllCollectionsAdmin,
  toggleActiveCollection,
  addCollection,
  getCollectionDetailsAdmin,
  editCollection,
  deleteCollection,
} from "../../controllers/admin/adminCollectionController.js";
import { uploadSingleImage } from "../../middlewares/uploadSingleImage.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "viewer"), getAllCollectionsAdmin);
router.get(
  "/:collectionId",
  protect,
  authorize("admin", "viewer"),
  getCollectionDetailsAdmin
);
// thêm
router.post("/", protect, authorize("admin"), uploadSingleImage, addCollection);
// sửa
router.put(
  "/:collectionId/edit",
  protect,
  authorize("admin"),
  uploadSingleImage,
  editCollection
);

router.delete(
  "/:collectionId/delete",
  protect,
  authorize("admin"),
  deleteCollection
);

// ẩn hiện
router.patch(
  "/:collectionId/toggle-active",
  protect,
  authorize("admin"),
  toggleActiveCollection
);
export default router;
