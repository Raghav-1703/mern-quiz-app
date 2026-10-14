import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  HelpCircle,
  LayoutDashboard,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  BookOpen
} from "lucide-react";
import { fetchResultById } from "../../services/resultService.js";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'correct', 'incorrect'

  useEffect(() => {
    fetchResultById(id)
      .then((data) => setResult(data))
      .catch((err) => {
        console.error("Failed to fetch result:", err);
        setError(err.response?.data?.message || "Unable to load quiz results.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="state-msg-container">
        <div className="spinner" />
        <p className="state-msg">Grading submission & compiling breakdown…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container" style={{ padding: "60px 24px", maxWidth: "600px" }}>
        <div className="card-modern text-center" style={{ padding: "40px 32px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--coral-light)",
              color: "var(--coral)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}
          >
            <XCircle size={32} />
          </div>
          <h2 style={{ fontSize: "24px", marginBottom: "12px", color: "var(--text-heading)" }}>
            Result Not Found
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px" }}>
            {error || "Could not retrieve results for this attempt."}
          </p>
          <Link to="/dashboard" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <LayoutDashboard size={18} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const percentage = result.percentage || 0;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const getCelebration = () => {
    if (percentage >= 90) return { title: "Outstanding Mastery! 🏆", desc: "You performed exceptionally well on this quiz." };
    if (percentage >= 75) return { title: "Great Job! 🎉", desc: "You passed with strong confidence and accuracy." };
    if (percentage >= 50) return { title: "Good Effort! 👏", desc: "You're getting there! Review missed concepts below." };
    return { title: "Keep Practicing! 💪", desc: "Review your explanations below to sharpen your knowledge." };
  };

  const celebration = getCelebration();

  const filteredAnswers = (result.answers || []).filter((item) => {
    if (activeFilter === "correct") return item.isCorrect;
    if (activeFilter === "incorrect") return !item.isCorrect;
    return true;
  });

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "920px" }}>
      {/* Result Hero Header */}
      <div className="card-modern text-center" style={{ padding: "48px 32px 40px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "var(--primary-gradient)"
          }}
        />

        <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <Sparkles size={14} /> Official Performance Assessment
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
          {celebration.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "540px", margin: "0 auto 28px" }}>
          {result.quiz?.title ? `For quiz: ${result.quiz.title}` : celebration.desc}
        </p>

        {/* Circular Progress Gauge */}
        <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto 32px" }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#F1EDF8"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#quizGrad)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
            <defs>
              <linearGradient id="quizGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginTop: "4px" }}>
              {result.score} / {result.totalMarks} Marks
            </span>
          </div>
        </div>

        {/* 4 Performance Metric Boxes */}
        <div className="stat-grid" style={{ marginBottom: "32px" }}>
          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "var(--green-light)", color: "#15803d" }}>
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-number">{result.correctAnswers}</div>
            <div className="stat-title">Correct Answers</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "var(--coral-light)", color: "var(--coral)" }}>
              <XCircle size={24} />
            </div>
            <div className="stat-number">{result.incorrectAnswers}</div>
            <div className="stat-title">Incorrect / Skipped</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "var(--amber-light)", color: "#b45309" }}>
              <Clock size={24} />
            </div>
            <div className="stat-number">{formatTime(result.timeTaken)}</div>
            <div className="stat-title">Time Taken</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrap" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <Award size={24} />
            </div>
            <div className="stat-number">{result.totalQuestions}</div>
            <div className="stat-title">Total Questions</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          {result.quiz?._id && (
            <Link
              to={`/leaderboard/${result.quiz._id}`}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Trophy size={18} />
              View Quiz Leaderboard
            </Link>
          )}
          <Link
            to="/dashboard"
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <LayoutDashboard size={18} />
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Question-by-Question Review Section */}
      {result.answers && result.answers.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px"
            }}
          >
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={22} color="var(--primary)" />
                Detailed Question Review
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
                Review your selections, correct answers, and conceptual rationales.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", background: "var(--surface)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeFilter === "all" ? "var(--primary)" : "transparent",
                  color: activeFilter === "all" ? "#fff" : "var(--text-muted)"
                }}
              >
                All ({result.answers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("correct")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeFilter === "correct" ? "var(--green)" : "transparent",
                  color: activeFilter === "correct" ? "#fff" : "var(--text-muted)"
                }}
              >
                Correct ({result.correctAnswers})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("incorrect")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeFilter === "incorrect" ? "var(--coral)" : "transparent",
                  color: activeFilter === "incorrect" ? "#fff" : "var(--text-muted)"
                }}
              >
                Incorrect ({result.incorrectAnswers})
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {filteredAnswers.map((item, idx) => {
              const isCorrect = item.isCorrect;
              const answered = item.selectedAnswer !== null && item.selectedAnswer !== undefined;

              return (
                <div
                  key={idx}
                  className="card-modern"
                  style={{
                    padding: "24px 28px",
                    borderLeft: `5px solid ${isCorrect ? "var(--green)" : "var(--coral)"}`
                  }}
                >
                  {/* Question header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px"
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Question {idx + 1}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 12px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: isCorrect ? "var(--green-light)" : "var(--coral-light)",
                        color: isCorrect ? "#15803d" : "var(--coral)"
                      }}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 size={14} /> Correct (+1 Mark)
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> {answered ? "Incorrect" : "Unanswered"}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Question text */}
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "var(--text-heading)",
                      marginBottom: "18px",
                      lineHeight: 1.45
                    }}
                  >
                    {item.questionText}
                  </h3>

                  {/* Options List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selectedAnswer === optIdx;
                      const isCorrectChoice = item.correctAnswer === optIdx;

                      let rowBg = "var(--surface-raised)";
                      let rowBorder = "var(--border)";
                      let textColor = "var(--text-main)";

                      if (isCorrectChoice) {
                        rowBg = "var(--green-light)";
                        rowBorder = "#86efac";
                        textColor = "#14532d";
                      } else if (isUserChoice && !isCorrect) {
                        rowBg = "var(--coral-light)";
                        rowBorder = "#fca5a5";
                        textColor = "#7f1d1d";
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            background: rowBg,
                            border: `1.5px solid ${rowBorder}`,
                            color: textColor,
                            fontSize: "14px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                background: isCorrectChoice ? "#15803d" : isUserChoice ? "#b91c1c" : "var(--surface)",
                                color: isCorrectChoice || isUserChoice ? "#ffffff" : "var(--text-muted)",
                                border: "1px solid var(--border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                                flexShrink: 0
                              }}
                            >
                              {OPTION_LABELS[optIdx]}
                            </span>
                            <span style={{ fontWeight: isCorrectChoice || isUserChoice ? 600 : 400 }}>
                              {opt}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {isCorrectChoice && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-full)",
                                  background: "#15803d",
                                  color: "#ffffff"
                                }}
                              >
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-full)",
                                  background: "#b91c1c",
                                  color: "#ffffff"
                                }}
                              >
                                Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Callout */}
                  {item.explanation && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        background: "var(--primary-light)",
                        border: "1px solid var(--border-purple)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "var(--text-heading)",
                        lineHeight: 1.5
                      }}
                    >
                      <HelpCircle size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <strong style={{ color: "var(--primary)" }}>Explanation: </strong>
                        {item.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
