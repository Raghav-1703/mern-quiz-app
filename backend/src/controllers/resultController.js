import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

// GET /api/results/my (All quiz results for the logged-in user)
export const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .populate("quiz", "title quizCode duration category difficulty")
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error("Get my results error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch your quiz results." });
  }
};

// GET /api/results/:quizId (All participant results for a quiz - Admin/Creator)
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Only admin or the quiz creator can view all participants' results
    const isCreator = quiz.createdBy.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      // If regular user, return only their own result if it exists
      const ownResult = await QuizResult.findOne({ quiz: quizId, user: req.user._id })
        .populate("quiz", "title quizCode duration")
        .populate("user", "name email");

      if (!ownResult) {
        return res.status(404).json({ message: "No result found for your attempt." });
      }
      return res.json([ownResult]);
    }

    const results = await QuizResult.find({ quiz: quizId })
      .populate("user", "name email")
      .populate("quiz", "title quizCode duration")
      .sort({ score: -1, timeTaken: 1 });

    res.json(results);
  } catch (err) {
    console.error("Get quiz results error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch quiz results." });
  }
};

// GET /api/results/detail/:id (Single result inspection)
export const getResultById = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate("user", "name email")
      .populate("quiz", "title quizCode duration category difficulty");

    if (!result) {
      return res.status(404).json({ message: "Quiz result not found." });
    }

    // Authorization: User can view their own result, admin can view any
    const isOwner = result.user && result.user._id.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to view this result." });
    }

    res.json(result);
  } catch (err) {
    console.error("Get result by ID error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch result." });
  }
};

// GET /api/leaderboard/:quizId (Backend-calculated Leaderboard: Score desc, TimeTaken asc)
export const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).select("title quizCode duration questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Sort priority 1: Higher score (-1)
    // Sort priority 2: Lower timeTaken (1)
    // Sort priority 3: Earlier submission date (1)
    const results = await QuizResult.find({ quiz: quizId })
      .populate("user", "name email")
      .sort({ score: -1, timeTaken: 1, submittedAt: 1 })
      .limit(50);

    const leaderboard = results.map((item, index) => ({
      rank: index + 1,
      resultId: item._id,
      userId: item.user ? item.user._id : null,
      playerName: item.user ? item.user.name : "Anonymous Participant",
      playerEmail: item.user ? item.user.email : "",
      score: item.score,
      totalMarks: item.totalMarks,
      percentage: item.percentage,
      correctAnswers: item.correctAnswers,
      totalQuestions: item.totalQuestions,
      timeTaken: item.timeTaken,
      submittedAt: item.submittedAt,
    }));

    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        quizCode: quiz.quizCode,
        duration: quiz.duration,
        totalQuestions: quiz.questions ? quiz.questions.length : 0,
      },
      totalParticipants: results.length,
      leaderboard,
    });
  } catch (err) {
    console.error("Get leaderboard error:", err);
    res.status(500).json({ message: err.message || "Failed to generate leaderboard." });
  }
};
