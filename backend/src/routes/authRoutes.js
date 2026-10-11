import express from "express";
import { signup, login, logout, getMe, becomeAdmin } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/become-admin", requireAuth, becomeAdmin);

export default router;
