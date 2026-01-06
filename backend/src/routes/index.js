import express from "express";
import { authorize, protect } from "../middlewares/authMiddleware.js";

// public routes
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import collectionRoutes from "./collectionRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import searchRoutes from "./searchRoutes.js";
// admin routes
import adminProductRoutes from "./admin/adminProductRoutes.js";
import adminOrderRoutes from "./admin/adminOrderRoutes.js";
import adminCollectionsRoutes from "./admin/adminCollectionRoutes.js";
import adminCategoryRoutes from "./admin/adminCategoryRoutes.js";
import adminUserRoutes from "./admin/adminUserRoutes.js";
import adminStatsRoutes from "./admin/adminStatsRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = express.Router();
// API Routes

// ===== PUBLIC =====
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/collections", collectionRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/search", searchRoutes);

// ===== ADMIN =====
router.use("/admin/products", adminProductRoutes);
router.use("/admin/orders", adminOrderRoutes);
adminCollectionsRoutes;
router.use("/admin/collections", adminCollectionsRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin/stats", adminStatsRoutes);

// ===== UPLOAD =====
router.use("/upload", protect, authorize("admin"), uploadRoutes);

export default router;
