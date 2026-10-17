import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Lock,
  Calendar,
  Clock,
  ArrowRight
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
  const [visibility, setVisibility] = useState("public"); // "public" | "private"
  const [isPublished, setIsPublished] = useState(true);
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [accessDeadline, setAccessDeadline] = useState("");
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

    if (scheduledStartTime && accessDeadline) {
      if (new Date(scheduledStartTime) >= new Date(accessDeadline)) {
        setError("Scheduled start time must be before the access deadline.");
        return;
      }
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
        visibility,
        isPublished,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime).toISOString() : null,
        accessDeadline: accessDeadline ? new Date(accessDeadline).toISOString() : null,
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
      <div className="container" style={{ padding: "48px 24px", maxWidth: "580px" }}>
        <div className="card-modern text-center" style={{ padding: "36px 28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-btn)",
              background: "rgba(63, 125, 88, 0.12)",
              color: "var(--easy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            <CheckCircle2 size={30} />
          </div>

          <div className="hero-pill-badge" style={{ marginBottom: "12px" }}>
            <Sparkles size={13} />
            <span>Quiz Published</span>
          </div>

          <h1 style={{ fontSize: "24px", color: "var(--text)", marginBottom: "6px" }}>
            Quiz is Live!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "22px" }}>
            {createdQuiz.visibility === "private"
              ? "This private quiz requires students to enter the unique access code below."
              : "This public quiz is published and ready for participants."}
          </p>

          {/* Access Code Box */}
          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "20px",
              marginBottom: "22px"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Official Student Access Code
            </span>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "30px",
                fontWeight: 700,
                color: "var(--primary)",
                letterSpacing: "0.08em",
                margin: "6px 0 14px"
              }}
            >
              {createdQuiz.quizCode}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={copyCode}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied to Clipboard" : "Copy Access Code"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              padding: "12px",
              marginBottom: "24px",
              textAlign: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Duration</div>
              <strong style={{ color: "var(--text)", fontSize: "13px" }}>{createdQuiz.duration} min</strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Questions</div>
              <strong style={{ color: "var(--text)", fontSize: "13px" }}>{createdQuiz.questions?.length || questions.length}</strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Visibility</div>
              <strong style={{ color: "var(--text)", fontSize: "13px", textTransform: "capitalize" }}>{createdQuiz.visibility}</strong>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <Link to="/admin/dashboard" className="btn-primary">
              Return to Dashboard
            </Link>
            <Link to={`/quiz/${createdQuiz._id}`} className="btn-secondary">
              Preview Candidate View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "860px", marginTop: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
          <Sparkles size={13} />
          <span>Authoring Studio</span>
        </div>
        <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "4px" }}>
          Create a New Quiz
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Build questions, select correct answers, and configure access deadlines.
        </p>
      </div>

      {error && <div className="alert-box alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* Section 1: General Info */}
        <div className="card-modern">
          <h2 style={{ fontSize: "18px", color: "var(--text)", marginBottom: "16px" }}>
            1. General Information
          </h2>

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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
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

        {/* Section 2: Visibility & Scheduling */}
        <div className="card-modern">
          <h2 style={{ fontSize: "18px", color: "var(--text)", marginBottom: "16px" }}>
            2. Visibility & Access Schedule
          </h2>

          {/* Visibility Selector */}
          <div className="form-group">
            <label>Quiz Visibility</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: visibility === "public" ? "var(--primary-soft)" : "var(--bg)",
                  border: `1px solid ${visibility === "public" ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius-btn)",
                  padding: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="quiz-visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                />
                <div>
                  <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                    <Globe size={15} color="var(--primary)" /> Public Quiz
                  </strong>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Listed in the public catalog. Accessible to all logged-in students.
                  </p>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: visibility === "private" ? "var(--primary-soft)" : "var(--bg)",
                  border: `1px solid ${visibility === "private" ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius-btn)",
                  padding: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="quiz-visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                />
                <div>
                  <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                    <Lock size={15} color="var(--primary)" /> Private Quiz
                  </strong>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Hidden from public listings. Requires your unique access code to join.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Scheduling Times */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} color="var(--primary)" />
                Scheduled Start Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Leave empty for immediate availability upon publishing.
              </span>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} color="var(--hard)" />
                Access Deadline / Expiry (Optional)
              </label>
              <input
                type="datetime-local"
                value={accessDeadline}
                onChange={(e) => setAccessDeadline(e.target.value)}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Time after which no new starts or joins are permitted.
              </span>
            </div>
          </div>

          {/* Published Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
            <input
              type="checkbox"
              id="publish-toggle"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
            />
            <label htmlFor="publish-toggle" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>
              Publish immediately (uncheck to save as draft)
            </label>
          </div>
        </div>

        {/* Section 3: Questions Builder */}
        <div className="card-modern">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "18px", color: "var(--text)" }}>
                3. Questions & Answer Key
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Select the radio button beside the option that represents the correct answer.
              </p>
            </div>

            <button type="button" className="btn-secondary-sm" onClick={addQuestion}>
              <Plus size={14} /> Add Question
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-btn)",
                  padding: "18px",
                }}
              >
                {/* Question Top Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", background: "var(--primary-soft)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                    Question #{qIndex + 1}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                      Marks:
                      <input
                        type="number"
                        min="1"
                        style={{ width: "50px", padding: "2px 6px", fontSize: "12px", textAlign: "center" }}
                        value={q.marks}
                        onChange={(e) => handleMarksChange(qIndex, e.target.value)}
                      />
                    </label>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        style={{ background: "none", border: "none", color: "var(--hard)", cursor: "pointer", padding: "2px" }}
                        title="Delete question"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Input */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <input
                    type="text"
                    placeholder="Enter question prompt..."
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    required
                    style={{ background: "var(--card)" }}
                  />
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Options (Select radio for correct answer):
                  </span>

                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: q.correctAnswer === optIndex ? "var(--primary-soft)" : "var(--card)",
                        border: `1px solid ${q.correctAnswer === optIndex ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--radius-btn)",
                        padding: "6px 10px",
                      }}
                    >
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", margin: 0 }}>
                        <input
                          type="radio"
                          name={`correct-answer-${qIndex}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                          style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                        />
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "var(--radius-sm)",
                            background: q.correctAnswer === optIndex ? "var(--primary)" : "var(--bg)",
                            color: q.correctAnswer === optIndex ? "#FFFFFF" : "var(--text-muted)",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                        style={{ border: "none", background: "transparent", padding: "4px", width: "100%", outline: "none", fontSize: "13px" }}
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                          title="Remove option"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}

                  {q.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOptionToQuestion(qIndex)}
                      className="btn-link"
                      style={{ fontSize: "12px", width: "fit-content", marginTop: "4px" }}
                    >
                      + Add another option
                    </button>
                  )}
                </div>

                {/* Explanation */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    placeholder="Optional rationale shown after test submission..."
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                    style={{ fontSize: "12px", background: "var(--card)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "18px", textAlign: "center" }}>
            <button type="button" className="btn-secondary" onClick={addQuestion}>
              <Plus size={15} /> Add Another Question
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
          <Link to="/admin/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Publishing Quiz…" : "Publish Quiz"}
            {!submitting && <ArrowRight size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
}
