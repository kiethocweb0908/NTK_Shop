import express from "express";
import { getAdminStats } from "../../controllers/admin/adminStatsController.js";
import { protect, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", protect, authorize("admin", "viewer"), getAdminStats);

export default router;
