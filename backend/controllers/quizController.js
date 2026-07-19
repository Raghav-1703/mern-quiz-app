import Quiz from "../models/Quiz.js";
import Score from "../models/Score.js";

// GET /api/quizzes  -> list quizzes without revealing correct answers
export const getQuizzes = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const quizzes = await Quiz.find(filter).select(
      "title category difficulty description timePerQuestion questions createdAt"
    );

    const sanitized = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      description: q.description,
      timePerQuestion: q.timePerQuestion,
      questionCount: q.questions.length,
      createdAt: q.createdAt,
    }));

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quizzes/:id -> single quiz, correct answers stripped out
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      description: quiz.description,
      timePerQuestion: quiz.timePerQuestion,
      questions: safeQuestions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quizzes -> create a new quiz (used by an admin / seed script)
export const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/quizzes/:id/submit -> grade answers server-side and store a score
// body: { playerName, answers: [{ questionId, selectedIndex }], timeTakenSeconds }
export const submitQuiz = async (req, res) => {
  try {
    const { playerName, answers = [], timeTakenSeconds = 0 } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (!playerName) return res.status(400).json({ message: "playerName is required" });

    let correctAnswers = 0;
    const breakdown = quiz.questions.map((question) => {
      const answer = answers.find((a) => a.questionId === String(question._id));
      const selectedIndex = answer ? answer.selectedIndex : null;
      const isCorrect = selectedIndex === question.correctIndex;
      if (isCorrect) correctAnswers += 1;

      return {
        questionId: question._id,
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
        selectedIndex,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const savedScore = await Score.create({
      quiz: quiz._id,
      playerName,
      score,
      totalQuestions,
      correctAnswers,
      timeTakenSeconds,
    });

    res.status(201).json({
      scoreId: savedScore._id,
      score,
      correctAnswers,
      totalQuestions,
      breakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quizzes/:id/leaderboard -> top 10 scores for a quiz
export const getLeaderboard = async (req, res) => {
  try {
    const scores = await Score.find({ quiz: req.params.id })
      .sort({ score: -1, timeTakenSeconds: 1 })
      .limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
