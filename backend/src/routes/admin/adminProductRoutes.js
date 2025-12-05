import express from "express";

import {
  getAdminProducts,
  createProduct,
} from "../../controllers/admin/adminProductController.js";
import { admin, protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getAdminProducts);

router.post("/", protect, admin, createProduct);

export default router;
