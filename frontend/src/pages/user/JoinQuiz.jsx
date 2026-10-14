import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinQuizByCode } from "../../services/quizService.js";
import { Key, Sparkles, AlertCircle, Clock, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
        err.response?.data?.message || "Invalid quiz code. Please verify and try again."
      );
      setQuizPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (quizPreview) {
      navigate(`/quiz/${quizPreview.quizId}`);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "560px", margin: "20px auto" }}>
      <div className="auth-card-clean">
        <div className="hero-pill-badge" style={{ marginBottom: "12px" }}>
          <Key size={13} />
          <span>Enter Quiz Session</span>
        </div>

        <h1 style={{ fontSize: "28px", color: "var(--text-heading)", marginBottom: "6px" }}>Join a Quiz</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
          Enter the unique 6-8 character code assigned by your instructor or peer.
        </p>

        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: "20px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleValidateCode} className="auth-form">
          <div className="form-group">
            <label htmlFor="quiz-code-input">Access Code</label>
            <div className="input-with-icon">
              <Key className="input-icon-left" size={18} />
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
                style={{ fontFamily: "var(--font-mono)", fontSize: "16px", letterSpacing: "0.08em" }}
                autoFocus
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: "13px" }} disabled={loading}>
            {loading ? "Validating Code…" : "Find Quiz →"}
          </button>
        </form>

        {quizPreview && (
          <div className="card-modern" style={{ marginTop: "28px", background: "linear-gradient(135deg, #fdfcff 0%, #f5f2ff 100%)", border: "1.5px solid var(--border-purple)" }}>
            <div className="hero-pill-badge" style={{ marginBottom: "8px", background: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" }}>
              <CheckCircle2 size={13} />
              <span>Quiz Verified & Associated</span>
            </div>

            <h3 style={{ fontSize: "20px", color: "var(--text-heading)", marginBottom: "14px" }}>
              {quizPreview.title}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "var(--text-body)", marginBottom: "18px" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Category:</span>{" "}
                <strong>{quizPreview.category || "General"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Difficulty:</span>{" "}
                <strong className="capitalize">{quizPreview.difficulty || "medium"}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} color="var(--primary)" />
                <strong>{quizPreview.duration} Minutes</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <HelpCircle size={14} color="var(--primary)" />
                <strong>{quizPreview.questionCount} Questions</strong>
              </div>
            </div>

            <div style={{ background: "rgba(244, 197, 80, 0.15)", border: "1px solid #fde68a", padding: "12px 14px", borderRadius: "var(--radius-md)", fontSize: "12px", color: "#92400e", marginBottom: "18px", lineHeight: "1.5" }}>
              <strong>⚠️ Exam Instructions:</strong>
              <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                <li>The server countdown timer begins as soon as you start.</li>
                <li>Answers automatically submit when the clock reaches 00:00.</li>
                <li>Only 1 submission is allowed per user.</li>
              </ul>
            </div>

            <button onClick={handleStartQuiz} className="btn-primary" style={{ width: "100%", padding: "13px" }}>
              Begin Quiz Now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
