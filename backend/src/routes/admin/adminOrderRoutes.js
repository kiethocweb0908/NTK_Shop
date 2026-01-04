import express from "express";
import { authorize, protect } from "../../middlewares/authMiddleware.js";
import {
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getOrderByIdAdmin,
} from "../../controllers/admin/adminOrderController.js";

const router = express.Router();

// lấy tất cả order
router.get("/", protect, authorize("admin", "viewer"), getAllOrdersAdmin);
// Chi tiêt order
router.get(
  "/:orderId",
  protect,
  authorize("admin", "viewer"),
  getOrderByIdAdmin
);
// cập nhật trạng thái
router.patch(
  "/:orderId/status",
  protect,
  authorize("admin"),
  updateOrderStatusAdmin
);

export default router;
