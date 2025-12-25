import express from "express";
import {
  capturePayPalOrder,
  createPayPalOrder,
} from "../controllers/paypalController.js";

const router = express.Router();

router.post("/paypal/create", createPayPalOrder);
router.post("/paypal/capture", capturePayPalOrder);

export default router;
