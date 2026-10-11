import express from "express";
import {
  getMyResults,
  getQuizResults,
  getResultById,
  getLeaderboard,
} from "../controllers/resultController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", requireAuth, getMyResults);
router.get("/detail/:id", requireAuth, getResultById);
router.get("/leaderboard/:quizId", requireAuth, getLeaderboard);
router.get("/:quizId", requireAuth, getQuizResults);

export default router;
