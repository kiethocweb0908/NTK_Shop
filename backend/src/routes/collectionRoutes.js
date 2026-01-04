import express from "express";
import { getCollections } from "../controllers/collectionController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

// Public router
router.get("/", getCollections);

export default router;
