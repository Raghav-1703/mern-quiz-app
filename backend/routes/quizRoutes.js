import express from "express";
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getLeaderboard,
  deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/", getQuizzes);
router.post("/", createQuiz);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/leaderboard", getLeaderboard);
router.delete("/:id", deleteQuiz);

export default router;
