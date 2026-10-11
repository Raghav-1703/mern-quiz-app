import express from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  joinByCode,
  getQuizForAttempt,
  submitQuiz,
  deleteQuiz,
  getAdminQuizzes,
  getEnrolledQuizzes,
} from "../controllers/quizController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public / Authenticated quiz operations
router.get("/", getQuizzes);
router.post("/join", requireAuth, joinByCode);
router.get("/enrolled", requireAuth, getEnrolledQuizzes);
router.get("/admin/my", requireAuth, requireAdmin, getAdminQuizzes);
router.get("/:id", requireAuth, getQuizById);
router.get("/:id/attempt", requireAuth, getQuizForAttempt);
router.post("/:id/submit", requireAuth, submitQuiz);

// Admin-only management
router.post("/", requireAuth, requireAdmin, createQuiz);
router.delete("/:id", requireAuth, requireAdmin, deleteQuiz);

export default router;
