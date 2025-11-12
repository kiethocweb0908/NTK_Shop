import express from "express";
import { registerUser } from "../controllers/userController.js";

const router = express.Router();

// @route POST /api/user/register
// @desc Register a new user
// @access Public
router.post("/register", registerUser);

// module.exports = router;
export default router;
