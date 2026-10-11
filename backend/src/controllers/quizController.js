import crypto from "crypto";
import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import QuizResult from "../models/QuizResult.js";

// Helper to generate a unique quiz code, e.g., "MERN4821" or "QUIZ8372"
const generateUniqueQuizCode = async (prefix = "QUIZ") => {
  const cleanPrefix = (prefix || "QUIZ")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase() || "QUIZ";

  let uniqueCode = "";
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 20) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    uniqueCode = `${cleanPrefix}${randomDigits}`;
    exists = await Quiz.exists({ quizCode: uniqueCode });
    attempts++;
  }

  if (exists) {
    uniqueCode = `QZ${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }

  return uniqueCode;
};

// POST /api/quizzes (Admin only)
export const createQuiz = async (req, res) => {
  try {
    const { title, description, duration, category, difficulty, questions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Quiz title is required." });
    }

    const durationNum = Number(duration);
    if (!durationNum || durationNum < 1) {
      return res.status(400).json({ message: "Duration must be at least 1 minute." });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required." });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.question.trim()) {
        return res.status(400).json({ message: `Question #${i + 1} is missing question text.` });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: `Question #${i + 1} must have at least 2 options.` });
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          return res.status(400).json({ message: `Question #${i + 1}, option #${j + 1} cannot be empty.` });
        }
      }
      const correctIdx = Number(q.correctAnswer);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= q.options.length) {
        return res.status(400).json({
          message: `Question #${i + 1} has an invalid correct answer index (must be 0 to ${q.options.length - 1}).`,
        });
      }
    }

    const prefix = title.split(" ")[0].slice(0, 4);
    const quizCode = await generateUniqueQuizCode(prefix);

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      quizCode,
      duration: durationNum,
      category: category ? category.trim() : "General",
      difficulty: difficulty || "medium",
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: Number(q.correctAnswer),
        marks: Number(q.marks) || 1,
        explanation: q.explanation ? q.explanation.trim() : "",
      })),
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Quiz created successfully.",
      quiz,
    });
  } catch (err) {
    console.error("Create quiz error:", err);
    res.status(500).json({ message: err.message || "Failed to create quiz." });
  }
};

// GET /api/quizzes (List quizzes with safe public metadata)
export const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { quizCode: { $regex: search, $options: "i" } },
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const sanitized = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      quizCode: q.quizCode,
      duration: q.duration,
      category: q.category,
      difficulty: q.difficulty,
      questionCount: q.questions.length,
      totalMarks: q.questions.reduce((sum, item) => sum + (item.marks || 1), 0),
      createdBy: q.createdBy,
      createdAt: q.createdAt,
    }));

    res.json(sanitized);
  } catch (err) {
    console.error("Get quizzes error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch quizzes." });
  }
};

// GET /api/quizzes/:id (Quiz details)
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("createdBy", "name email");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const isCreator = req.user && quiz.createdBy && quiz.createdBy._id.equals(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";

    // If admin/creator is managing it, include questions with correctAnswer
    if (isCreator || isAdmin) {
      return res.json(quiz);
    }

    // Otherwise safe questions only
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      marks: q.marks,
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      quizCode: quiz.quizCode,
      duration: quiz.duration,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: safeQuestions,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
    });
  } catch (err) {
    console.error("Get quiz by ID error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch quiz." });
  }
};

// POST /api/quizzes/join (Validate quiz code, associate student, and verify status)
export const joinByCode = async (req, res) => {
  try {
    const { quizCode } = req.body;
    if (!quizCode || !quizCode.trim()) {
      return res.status(400).json({ message: "Please provide a quiz code." });
    }

    const code = quizCode.trim().toUpperCase();
    const quiz = await Quiz.findOne({ quizCode: code }).populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({ message: `Invalid code. No quiz or class found with access code "${code}".` });
    }

    // Associate student with the admin and quiz represented by this code
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.enrolledCodes) user.enrolledCodes = [];
      const alreadyEnrolled = user.enrolledCodes.some(
        (e) => String(e.quiz) === String(quiz._id) || e.code === code
      );
      if (!alreadyEnrolled) {
        user.enrolledCodes.push({
          code: quiz.quizCode,
          quiz: quiz._id,
          admin: quiz.createdBy ? quiz.createdBy._id : null,
          joinedAt: new Date(),
        });
        await user.save();
      }
    }

    // Check if current user has already submitted this quiz
    const existingResult = await QuizResult.findOne({
      user: req.user._id,
      quiz: quiz._id,
    });

    if (existingResult) {
      return res.json({
        quizId: quiz._id,
        title: quiz.title,
        quizCode: quiz.quizCode,
        duration: quiz.duration,
        questionCount: quiz.questions.length,
        alreadySubmitted: true,
        resultId: existingResult._id,
        admin: quiz.createdBy ? { _id: quiz.createdBy._id, name: quiz.createdBy.name, email: quiz.createdBy.email } : null,
        message: "You have already completed this quiz.",
      });
    }

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      quizCode: quiz.quizCode,
      duration: quiz.duration,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      admin: quiz.createdBy ? { _id: quiz.createdBy._id, name: quiz.createdBy.name, email: quiz.createdBy.email } : null,
      alreadySubmitted: false,
      message: `Access granted! Associated with ${quiz.createdBy?.name || "Admin"}'s quiz session.`,
    });
  } catch (err) {
    console.error("Join by code error:", err);
    res.status(500).json({ message: err.message || "Failed to join quiz." });
  }
};

// GET /api/quizzes/:id/attempt (Start or resume quiz attempt safely)
export const getQuizForAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Verify student is associated with the admin's quiz via code OR is creator/admin
    const isCreatorOrAdmin = req.user.role === "admin" || (quiz.createdBy && quiz.createdBy.equals(req.user._id));
    const user = await User.findById(req.user._id);
    const isEnrolled = user?.enrolledCodes?.some(
      (e) => String(e.quiz) === String(quiz._id) || e.code === quiz.quizCode
    );

    if (!isCreatorOrAdmin && !isEnrolled) {
      return res.status(403).json({
        message: "Access restricted. You can only access this quiz after entering its valid admin code.",
        requiresCode: true,
      });
    }

    // Duplicate submission check
    const existingResult = await QuizResult.findOne({
      user: req.user._id,
      quiz: quiz._id,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "You have already submitted this quiz. Multiple attempts are not permitted.",
        resultId: existingResult._id,
        alreadySubmitted: true,
      });
    }

    // Track or retrieve server-controlled attempt
    let attempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quiz._id,
      isCompleted: false,
    });

    if (!attempt) {
      attempt = await QuizAttempt.create({
        user: req.user._id,
        quiz: quiz._id,
        startedAt: new Date(),
      });
    }

    const totalSeconds = quiz.duration * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

    // CRITICAL: NEVER leak correctAnswer or explanations to the client
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      marks: q.marks || 1,
    }));

    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      quizCode: quiz.quizCode,
      duration: quiz.duration,
      totalSeconds,
      remainingSeconds,
      startedAt: attempt.startedAt,
      serverTime: new Date(),
      questions: safeQuestions,
    });
  } catch (err) {
    console.error("Get quiz attempt error:", err);
    res.status(500).json({ message: err.message || "Failed to prepare quiz attempt." });
  }
};

// POST /api/quizzes/:id/submit (Server-side answer validation & score calculation)
export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Verify student is associated with the quiz/admin via valid code
    const isCreatorOrAdmin = req.user.role === "admin" || (quiz.createdBy && quiz.createdBy.equals(req.user._id));
    const user = await User.findById(req.user._id);
    const isEnrolled = user?.enrolledCodes?.some(
      (e) => String(e.quiz) === String(quiz._id) || e.code === quiz.quizCode
    );

    if (!isCreatorOrAdmin && !isEnrolled) {
      return res.status(403).json({
        message: "Access restricted. You must join this quiz with a valid admin code before submitting.",
      });
    }

    // 1. Prevent duplicate submission
    const existingResult = await QuizResult.findOne({
      user: req.user._id,
      quiz: quiz._id,
    });

    if (existingResult) {
      return res.status(400).json({
        message: "You have already submitted this quiz.",
        resultId: existingResult._id,
      });
    }

    // 2. Server-side elapsed time calculation (do NOT trust frontend timer)
    const attempt = await QuizAttempt.findOne({
      user: req.user._id,
      quiz: quiz._id,
    }).sort({ createdAt: -1 });

    const totalDurationSeconds = quiz.duration * 60;
    let timeTakenSeconds = 0;

    if (attempt) {
      const serverElapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      timeTakenSeconds = Math.min(Math.max(serverElapsed, 1), totalDurationSeconds);
    } else {
      timeTakenSeconds = Math.min(Number(req.body.timeTakenSeconds) || 60, totalDurationSeconds);
    }

    // 3. Score calculation using canonical answers from MongoDB
    const submittedAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const answersMap = new Map();
    submittedAnswers.forEach((a) => {
      if (a && a.questionId) {
        answersMap.set(String(a.questionId), a.selectedAnswer);
      }
    });

    let score = 0;
    let totalMarks = 0;
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let unansweredCount = 0;

    const detailedAnswers = quiz.questions.map((question) => {
      const qIdStr = String(question._id);
      const selected = answersMap.has(qIdStr) ? answersMap.get(qIdStr) : null;
      const isAnswered = selected !== null && selected !== undefined && selected !== -1;
      const isCorrect = isAnswered && Number(selected) === question.correctAnswer;
      const questionMarks = question.marks || 1;

      totalMarks += questionMarks;

      let marksObtained = 0;
      if (isCorrect) {
        marksObtained = questionMarks;
        score += questionMarks;
        correctAnswersCount++;
      } else if (isAnswered) {
        incorrectAnswersCount++;
      } else {
        unansweredCount++;
      }

      return {
        questionId: question._id,
        questionText: question.question,
        options: question.options,
        selectedAnswer: isAnswered ? Number(selected) : null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksObtained,
        maxMarks: questionMarks,
        explanation: question.explanation || "",
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    // 4. Store QuizResult in MongoDB
    const quizResult = await QuizResult.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      totalMarks,
      percentage,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      unanswered: unansweredCount,
      timeTaken: timeTakenSeconds,
      answers: detailedAnswers,
      submittedAt: new Date(),
    });

    // Mark attempt completed
    if (attempt) {
      attempt.isCompleted = true;
      await attempt.save();
    }

    res.status(201).json({
      message: "Quiz submitted successfully.",
      result: quizResult,
    });
  } catch (err) {
    // Catch duplicate key errors gracefully
    if (err.code === 11000) {
      const existing = await QuizResult.findOne({ user: req.user._id, quiz: req.params.id });
      return res.status(400).json({
        message: "You have already submitted this quiz.",
        resultId: existing?._id,
      });
    }
    console.error("Submit quiz error:", err);
    res.status(500).json({ message: err.message || "Failed to submit quiz." });
  }
};

// DELETE /api/quizzes/:id (Admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Verify ownership
    if (!quiz.createdBy.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this quiz." });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    await QuizResult.deleteMany({ quiz: req.params.id });
    await QuizAttempt.deleteMany({ quiz: req.params.id });

    res.json({ message: "Quiz and its associated records have been removed." });
  } catch (err) {
    console.error("Delete quiz error:", err);
    res.status(500).json({ message: err.message || "Failed to delete quiz." });
  }
};

// GET /api/quizzes/admin/my (Admin's created quizzes with metrics)
export const getAdminQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const results = await QuizResult.find({ quiz: quiz._id });
        const participantCount = results.length;
        const avgScore =
          participantCount > 0
            ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / participantCount)
            : 0;

        return {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          quizCode: quiz.quizCode,
          duration: quiz.duration,
          category: quiz.category,
          difficulty: quiz.difficulty,
          questionCount: quiz.questions.length,
          participantCount,
          avgScore,
          createdAt: quiz.createdAt,
        };
      })
    );

    res.json(quizzesWithStats);
  } catch (err) {
    console.error("Get admin quizzes error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch your quizzes." });
  }
};

// GET /api/quizzes/enrolled (Student's quizzes associated via valid admin codes)
export const getEnrolledQuizzes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "enrolledCodes.quiz",
      select: "title description quizCode duration category difficulty questions createdBy",
      populate: { path: "createdBy", select: "name email" },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const enrolledList = (user.enrolledCodes || [])
      .filter((e) => e.quiz)
      .map((e) => ({
        _id: e.quiz._id,
        title: e.quiz.title,
        description: e.quiz.description,
        quizCode: e.code || e.quiz.quizCode,
        duration: e.quiz.duration,
        category: e.quiz.category,
        difficulty: e.quiz.difficulty,
        questionCount: e.quiz.questions ? e.quiz.questions.length : 0,
        admin: e.quiz.createdBy,
        joinedAt: e.joinedAt,
      }));

    res.json(enrolledList);
  } catch (err) {
    console.error("Get enrolled quizzes error:", err);
    res.status(500).json({ message: "Failed to fetch enrolled quizzes." });
  }
};
