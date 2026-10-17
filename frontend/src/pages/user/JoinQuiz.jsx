import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinQuizByCode } from "../../services/quizService.js";
import { Key, AlertCircle, Clock, HelpCircle, CheckCircle2, Calendar } from "lucide-react";

export default function JoinQuiz() {
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizPreview, setQuizPreview] = useState(null);

  const navigate = useNavigate();

  const handleValidateCode = async (e) => {
    e.preventDefault();
    if (!quizCode.trim()) return;

    setError("");
    setLoading(true);

    try {
      const data = await joinQuizByCode(quizCode.trim());
      if (data.alreadySubmitted) {
        navigate(`/result/${data.resultId}`);
        return;
      }
      setQuizPreview(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid access code. Please verify and try again."
      );
      setQuizPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (quizPreview && quizPreview.status === "active") {
      navigate(`/quiz/${quizPreview.quizId}`);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "540px", margin: "24px auto" }}>
      <div className="auth-card-clean">
        <div className="hero-pill-badge" style={{ marginBottom: "12px" }}>
          <Key size={13} />
          <span>Enter Quiz Session</span>
        </div>

        <h1 style={{ fontSize: "26px", color: "var(--text)", marginBottom: "4px" }}>Join Private Quiz</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "22px" }}>
          Enter the access code provided by your educator to unlock the assessment.
        </p>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: "18px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleValidateCode} className="auth-form">
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="quiz-code-input">Access Code</label>
            <div className="input-with-icon">
              <Key className="input-icon-left" size={17} />
              <input
                id="quiz-code-input"
                type="text"
                placeholder="e.g. MERN4821"
                value={quizCode}
                onChange={(e) => {
                  setQuizCode(e.target.value.toUpperCase());
                  setError("");
                }}
                maxLength={12}
                style={{ fontFamily: "var(--font-mono)", fontSize: "15px", letterSpacing: "0.08em" }}
                autoFocus
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: "12px" }} disabled={loading}>
            {loading ? "Validating Code…" : "Find Quiz"}
          </button>
        </form>

        {quizPreview && (
          <div className="card-modern" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span className={`status-pill status-${quizPreview.status}`}>
                {quizPreview.status}
              </span>
              <span className="code-pill">{quizPreview.quizCode}</span>
            </div>

            <h3 style={{ fontSize: "19px", color: "var(--text)", marginBottom: "12px" }}>
              {quizPreview.title}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "var(--text)", marginBottom: "16px" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Category:</span>{" "}
                <strong>{quizPreview.category || "General"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Difficulty:</span>{" "}
                <strong style={{ textTransform: "capitalize" }}>{quizPreview.difficulty || "medium"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} color="var(--primary)" />
                <span>{quizPreview.duration} Minutes Duration</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <HelpCircle size={14} color="var(--primary)" />
                <span>{quizPreview.questionCount} Questions</span>
              </div>
            </div>

            {quizPreview.accessDeadline && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                <Calendar size={13} />
                <span>Access deadline: {new Date(quizPreview.accessDeadline).toLocaleString()}</span>
              </div>
            )}

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "12px 14px", borderRadius: "var(--radius-btn)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "18px", lineHeight: "1.5" }}>
              <strong style={{ color: "var(--text)" }}>Exam Rules:</strong>
              <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                <li>The server countdown starts immediately when you begin.</li>
                <li>Your attempt automatically submits when the timer reaches 00:00.</li>
                <li>Only one attempt is permitted.</li>
              </ul>
            </div>

            {quizPreview.status === "active" ? (
              <button onClick={handleStartQuiz} className="btn-primary" style={{ width: "100%", padding: "12px" }}>
                Begin Quiz Now
              </button>
            ) : quizPreview.status === "scheduled" ? (
              <div className="alert-box alert-warning">
                <span>This quiz has not opened yet. Check back at the scheduled start time.</span>
              </div>
            ) : (
              <div className="alert-box alert-error">
                <span>This quiz is closed or has expired.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
