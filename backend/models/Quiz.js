import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: (v) => Array.isArray(v) && v.length >= 2,
  },
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, default: "General" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    description: { type: String, default: "" },
    timePerQuestion: { type: Number, default: 20 }, // seconds
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
