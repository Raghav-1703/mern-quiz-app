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
  Sparkles,
  BookOpen
} from "lucide-react";
import { fetchResultById } from "../../services/resultService.js";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Grading submission & compiling results…
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container" style={{ padding: "48px 24px", maxWidth: "560px" }}>
        <div className="card-modern text-center" style={{ padding: "36px 24px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "var(--radius-btn)",
              background: "rgba(178, 58, 58, 0.12)",
              color: "var(--hard)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            <XCircle size={26} />
          </div>
          <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "var(--text)" }}>
            Result Not Found
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            {error || "Could not retrieve results for this attempt."}
          </p>
          <Link to="/dashboard" className="btn-primary">
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
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const getCelebration = () => {
    if (percentage >= 90) return { title: "Outstanding Mastery!", desc: "Excellent conceptual understanding." };
    if (percentage >= 75) return { title: "Great Job!", desc: "Passed with strong confidence and accuracy." };
    if (percentage >= 50) return { title: "Good Effort!", desc: "Review missed concepts below to improve." };
    return { title: "Keep Practicing!", desc: "Review your explanations below to sharpen your knowledge." };
  };

  const celebration = getCelebration();

  const filteredAnswers = (result.answers || []).filter((item) => {
    if (activeFilter === "correct") return item.isCorrect;
    if (activeFilter === "incorrect") return !item.isCorrect;
    return true;
  });

  return (
    <div className="container" style={{ maxWidth: "860px", marginTop: "20px" }}>
      {/* Result Hero Header */}
      <div className="card-modern" style={{ textAlign: "center", padding: "40px 24px", marginBottom: "24px" }}>
        <div className="hero-pill-badge" style={{ marginBottom: "12px" }}>
          <Sparkles size={13} />
          <span>Official Assessment Results</span>
        </div>

        <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "6px" }}>
          {celebration.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "480px", margin: "0 auto 24px" }}>
          {result.quiz?.title ? `For quiz: ${result.quiz.title}` : celebration.desc}
        </p>

        {/* Circular Progress Gauge */}
        <div style={{ position: "relative", width: "150px", height: "150px", margin: "0 auto 24px" }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="var(--primary-soft)"
              strokeWidth="10"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
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
            <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
              {result.score} / {result.totalMarks} Marks
            </span>
          </div>
        </div>

        {/* 4 Performance Metric Boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div className="stat-box" style={{ padding: "14px", justifyContent: "center" }}>
            <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className="stat-info-col" style={{ textAlign: "left" }}>
              <span className="stat-value" style={{ fontSize: "20px" }}>{result.correctAnswers}</span>
              <span className="stat-label-text">Correct</span>
            </div>
          </div>

          <div className="stat-box" style={{ padding: "14px", justifyContent: "center" }}>
            <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px", background: "rgba(178, 58, 58, 0.12)", color: "var(--hard)" }}>
              <XCircle size={18} />
            </div>
            <div className="stat-info-col" style={{ textAlign: "left" }}>
              <span className="stat-value" style={{ fontSize: "20px" }}>{result.incorrectAnswers}</span>
              <span className="stat-label-text">Incorrect</span>
            </div>
          </div>

          <div className="stat-box" style={{ padding: "14px", justifyContent: "center" }}>
            <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px" }}>
              <Clock size={18} />
            </div>
            <div className="stat-info-col" style={{ textAlign: "left" }}>
              <span className="stat-value" style={{ fontSize: "20px" }}>{formatTime(result.timeTaken)}</span>
              <span className="stat-label-text">Time Taken</span>
            </div>
          </div>

          <div className="stat-box" style={{ padding: "14px", justifyContent: "center" }}>
            <div className="stat-icon-wrapper" style={{ width: "36px", height: "36px" }}>
              <Award size={18} />
            </div>
            <div className="stat-info-col" style={{ textAlign: "left" }}>
              <span className="stat-value" style={{ fontSize: "20px" }}>{result.totalQuestions}</span>
              <span className="stat-label-text">Questions</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {result.quiz?._id && (
            <Link to={`/leaderboard/${result.quiz._id}`} className="btn-primary">
              <Trophy size={16} />
              View Leaderboard
            </Link>
          )}
          <Link to="/dashboard" className="btn-secondary">
            <LayoutDashboard size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Question Review Section */}
      {result.answers && result.answers.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "20px", color: "var(--text)" }}>Question Review</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Examine your responses, correct answers, and explanations.
              </p>
            </div>

            <div className="filter-tabs-row" style={{ marginBottom: 0 }}>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`filter-tab-btn ${activeFilter === "all" ? "active" : ""}`}
              >
                All ({result.answers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("correct")}
                className={`filter-tab-btn ${activeFilter === "correct" ? "active" : ""}`}
              >
                Correct ({result.correctAnswers})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("incorrect")}
                className={`filter-tab-btn ${activeFilter === "incorrect" ? "active" : ""}`}
              >
                Incorrect ({result.incorrectAnswers})
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredAnswers.map((item, idx) => {
              const isCorrect = item.isCorrect;
              const answered = item.selectedAnswer !== null && item.selectedAnswer !== undefined;

              return (
                <div key={idx} className="card-modern" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Question {idx + 1}
                    </span>
                    <span
                      className="badge-tag"
                      style={{
                        background: isCorrect ? "rgba(63, 125, 88, 0.12)" : "rgba(178, 58, 58, 0.12)",
                        color: isCorrect ? "var(--easy)" : "var(--hard)",
                      }}
                    >
                      {isCorrect ? "Correct (+1)" : answered ? "Incorrect" : "Unanswered"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16px", color: "var(--text)", marginBottom: "14px", lineHeight: 1.4 }}>
                    {item.questionText}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selectedAnswer === optIdx;
                      const isCorrectChoice = item.correctAnswer === optIdx;

                      let bg = "var(--bg)";
                      let borderColor = "var(--border)";
                      let color = "var(--text)";

                      if (isCorrectChoice) {
                        bg = "rgba(63, 125, 88, 0.12)";
                        borderColor = "var(--easy)";
                        color = "var(--easy)";
                      } else if (isUserChoice && !isCorrect) {
                        bg = "rgba(178, 58, 58, 0.12)";
                        borderColor = "var(--hard)";
                        color = "var(--hard)";
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "var(--radius-btn)",
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            color: color,
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                              {OPTION_LABELS[optIdx]}
                            </span>
                            <span style={{ fontWeight: isCorrectChoice || isUserChoice ? 600 : 400 }}>
                              {opt}
                            </span>
                          </div>

                          {isCorrectChoice && (
                            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                              Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div
                      style={{
                        background: "var(--primary-soft)",
                        border: "1px solid #C4DCD0",
                        borderRadius: "var(--radius-btn)",
                        padding: "10px 14px",
                        fontSize: "13px",
                        color: "var(--text)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <HelpCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
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
