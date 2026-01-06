import express from "express";

import { authorize, protect } from "../../middlewares/authMiddleware.js";
import {
  getAllUserAdmin,
  getUserDetailsAdmin,
} from "../../controllers/admin/adminUserController.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "viewer"), getAllUserAdmin);
router.get(
  "/:userId",
  protect,
  authorize("admin", "viewer"),
  getUserDetailsAdmin
);

export default router;
