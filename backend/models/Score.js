import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    playerName: { type: String, required: true, trim: true, maxlength: 40 },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

scoreSchema.index({ quiz: 1, score: -1 });

export default mongoose.model("Score", scoreSchema);
