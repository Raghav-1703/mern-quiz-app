import mongoose from "mongoose";

const submittedAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  selectedAnswer: { type: Number, default: null }, // index 0..N, or null if omitted
  correctAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  marksObtained: { type: Number, default: 0 },
  maxMarks: { type: Number, default: 1 },
  explanation: { type: String, default: "" },
});

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      required: true,
    },
    answers: [submittedAnswerSchema],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate submissions by the same user for the same quiz
quizResultSchema.index({ user: 1, quiz: 1 }, { unique: true });

// Optimize leaderboard sorting: higher score first, lower completion time second
quizResultSchema.index({ quiz: 1, score: -1, timeTaken: 1 });

const QuizResult = mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;
