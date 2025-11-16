import express from "express";
import {
  getCollections,
  createCollection,
  updateCollection,
  toggleActiveCollection,
  deleteCollection,
} from "../controllers/collectionController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Public router
router.get("/", getCollections);

// Protected admin router
router.post("/", protect, admin, createCollection);
router.put("/:id", protect, admin, updateCollection);
router.patch("/:id/active", protect, admin, toggleActiveCollection);
router.delete("/:id", protect, admin, deleteCollection);

export default router;
