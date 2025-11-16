import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", registerUser);

// @route POST /api/users/login
// @desc Autheticate user
// @access Public
router.post("/login", loginUser);

// @route GET /api/users/profile
// @desc Get logged-in user's profile (Protected Route)
// @access Private
router.get("/profile", protect, getUser);

// module.exports = router;
export default router;
