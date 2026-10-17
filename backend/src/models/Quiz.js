import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: (val) => Array.isArray(val) && val.length >= 2,
      message: "A question must have at least 2 options",
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index is required"],
    min: 0,
  },
  marks: {
    type: Number,
    default: 1,
    min: [1, "Marks must be at least 1"],
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    quizCode: {
      type: String,
      required: [true, "Quiz code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    duration: {
      type: Number,
      required: [true, "Quiz duration in minutes is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    scheduledStartTime: {
      type: Date,
      default: null,
    },
    accessDeadline: {
      type: Date,
      default: null,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "Quiz must have at least one question",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to determine the real-time calculated availability status
quizSchema.virtual("status").get(function () {
  if (!this.isPublished) return "draft";
  const now = new Date();
  if (this.scheduledStartTime && new Date(this.scheduledStartTime) > now) {
    return "scheduled";
  }
  if (this.accessDeadline && new Date(this.accessDeadline) < now) {
    return "expired";
  }
  return "active";
});

// Indexes for high-performance scheduling and visibility queries
quizSchema.index({ visibility: 1, isPublished: 1, scheduledStartTime: 1, accessDeadline: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
