import express from "express";

import { authorize, protect } from "../../middlewares/authMiddleware.js";
import { getAllUserAdmin } from "../../controllers/admin/adminUserController.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "viewer"), getAllUserAdmin);

export default router;
