import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  BookOpen,
  ArrowRight,
  HelpCircle,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";
import { createQuiz } from "../../services/quizService.js";

const DEFAULT_QUESTION = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  marks: 1,
  explanation: "",
});

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(10); // in minutes
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([DEFAULT_QUESTION(), DEFAULT_QUESTION()]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  // Question editing handlers
  const handleQuestionTextChange = (qIndex, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].question = text;
      return copy;
    });
  };

  const handleOptionChange = (qIndex, optIndex, val) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].options[optIndex] = val;
      return copy;
    });
  };

  const handleCorrectAnswerChange = (qIndex, correctIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].correctAnswer = Number(correctIdx);
      return copy;
    });
  };

  const handleMarksChange = (qIndex, marks) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].marks = Math.max(1, Number(marks) || 1);
      return copy;
    });
  };

  const handleExplanationChange = (qIndex, exp) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].explanation = exp;
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, DEFAULT_QUESTION()]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) {
      setError("Quiz must contain at least 1 question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addOptionToQuestion = (qIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length < 6) {
        copy[qIndex].options.push("");
      }
      return copy;
    });
  };

  const removeOptionFromQuestion = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length <= 2) {
        setError("Each question must have at least 2 options.");
        return copy;
      }
      copy[qIndex].options.splice(optIndex, 1);
      if (copy[qIndex].correctAnswer >= copy[qIndex].options.length) {
        copy[qIndex].correctAnswer = 0;
      }
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a quiz title.");
      return;
    }

    if (duration < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    // Validate all questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${OPTION_LETTERS[j]} cannot be empty.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        category,
        difficulty,
        questions,
      };

      const res = await createQuiz(payload);
      setCreatedQuiz(res.quiz);
    } catch (err) {
      console.error("Create quiz failed:", err);
      setError(err.response?.data?.message || "Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (createdQuiz?.quizCode) {
      navigator.clipboard.writeText(createdQuiz.quizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdQuiz) {
    return (
      <div className="container" style={{ padding: "60px 24px", maxWidth: "640px" }}>
        <div className="card-modern text-center" style={{ padding: "48px 36px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--green-light)",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <Sparkles size={14} /> Publication Complete
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
            Quiz is Published & Live!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "28px" }}>
            Candidates can join right now by entering your unique access code.
          </p>

          {/* Access Code Box */}
          <div
            style={{
              background: "var(--surface-raised)",
              border: "2px dashed var(--border-purple)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              marginBottom: "28px"
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Official Student Access Code
            </span>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "36px",
                fontWeight: 900,
                color: "var(--primary)",
                letterSpacing: "0.08em",
                margin: "8px 0 16px"
              }}
            >
              {createdQuiz.quizCode}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={copyCode}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 auto" }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied to Clipboard!" : "Copy Code"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "16px",
              marginBottom: "28px",
              textAlign: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Duration</div>
              <strong style={{ color: "var(--text-heading)" }}>{createdQuiz.duration} min</strong>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Questions</div>
              <strong style={{ color: "var(--text-heading)" }}>{createdQuiz.questions?.length || questions.length}</strong>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Difficulty</div>
              <strong style={{ color: "var(--text-heading)", textTransform: "capitalize" }}>{createdQuiz.difficulty}</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/admin/dashboard"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <LayoutDashboard size={18} /> Return to Dashboard
            </Link>
            <Link
              to={`/quiz/${createdQuiz._id}`}
              className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Preview Candidate View <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Sparkles size={14} /> Authoring Studio
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "6px" }}>
          Create a New Quiz
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Build questions, select correct answers, and publish an automated exam with real-time timer verification.
        </p>
      </div>

      {error && <div className="alert-box alert-error" style={{ marginBottom: "24px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Section 1: General Info */}
        <div className="card-modern" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "20px" }}>
            1. General Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-group">
              <label>Quiz Title *</label>
              <input
                type="text"
                placeholder="e.g. Full Stack MERN Fundamentals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Briefly describe what concepts this quiz tests..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px"
              }}
            >
              <div className="form-group">
                <label>Duration (Minutes) *</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Database">Database</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Questions Builder */}
        <div className="card-modern" style={{ padding: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px"
            }}
          >
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "4px" }}>
                2. Questions & Answer Key
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Click the radio button beside the option that represents the correct answer.
              </p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={addQuestion}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
            >
              <Plus size={16} /> Add Question
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                style={{
                  background: "var(--surface-raised)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px"
                }}
              >
                {/* Question Top Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "var(--primary)",
                      background: "var(--primary-light)",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    Question #{qIndex + 1}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>
                      Marks:
                      <input
                        type="number"
                        min="1"
                        style={{
                          width: "56px",
                          padding: "4px 8px",
                          fontSize: "13px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                          textAlign: "center"
                        }}
                        value={q.marks}
                        onChange={(e) => handleMarksChange(qIndex, e.target.value)}
                      />
                    </label>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--coral)",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center"
                        }}
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Input */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    placeholder="Enter question prompt (e.g. Which React hook manages lifecycle effects?)"
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    required
                    style={{ fontWeight: 600 }}
                  />
                </div>

                {/* Options list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Options (Select radio for correct answer):
                  </span>

                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: q.correctAnswer === optIndex ? "#f5f3ff" : "var(--surface)",
                        border: `1.5px solid ${q.correctAnswer === optIndex ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--radius-md)",
                        padding: "8px 12px"
                      }}
                    >
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: 0 }}>
                        <input
                          type="radio"
                          name={`correct-answer-${qIndex}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                          style={{ accentColor: "var(--primary)", width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <span
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: q.correctAnswer === optIndex ? "var(--primary)" : "var(--surface-raised)",
                            color: q.correctAnswer === optIndex ? "#ffffff" : "var(--text-muted)",
                            fontSize: "12px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {OPTION_LETTERS[optIndex]}
                        </span>
                      </label>

                      <input
                        type="text"
                        placeholder={`Option ${OPTION_LETTERS[optIndex]} text`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        required
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "6px",
                          width: "100%",
                          outline: "none",
                          fontSize: "14px"
                        }}
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-dim)",
                            cursor: "pointer",
                            padding: "4px"
                          }}
                          title="Remove option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {q.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOptionToQuestion(qIndex)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "left",
                        padding: "4px 0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Plus size={14} /> Add another option
                    </button>
                  )}
                </div>

                {/* Explanation */}
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Optional explanation shown to candidate after submission"
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                    style={{ fontSize: "13px", color: "var(--text-main)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={addQuestion}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={18} /> Add Another Question
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px" }}>
          <Link to="/admin/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            {submitting ? "Publishing Quiz & Generating Code…" : "Publish Quiz & Generate Code"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
