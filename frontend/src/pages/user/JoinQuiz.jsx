import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinQuizByCode } from "../../services/quizService.js";

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
    <div className="container join-page-container">
      <div className="auth-card">
        <div className="eyebrow">Enter Quiz Session</div>
        <h1 className="hero-title auth-title">Join a Quiz</h1>
        <p className="hero-sub auth-sub">
          Enter the unique 6-8 character code assigned to your quiz.
        </p>

        {error && <div className="alert-box alert-error">{error}</div>}

        <form onSubmit={handleValidateCode} className="join-form">
          <div className="form-group">
            <label htmlFor="quiz-code-input">Quiz Code</label>
            <input
              id="quiz-code-input"
              type="text"
              className="code-input-large"
              placeholder="e.g. MERN4821"
              value={quizCode}
              onChange={(e) => {
                setQuizCode(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={12}
              autoFocus
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Validating Code…" : "Find Quiz"}
          </button>
        </form>

        {quizPreview && (
          <div className="quiz-preview-card mt-6">
            <div className="eyebrow">Quiz Found</div>
            <h3>{quizPreview.title}</h3>
            <div className="quiz-preview-meta">
              <div>
                <span className="meta-label">Category:</span>{" "}
                <strong>{quizPreview.category || "General"}</strong>
              </div>
              <div>
                <span className="meta-label">Difficulty:</span>{" "}
                <strong className="capitalize">{quizPreview.difficulty || "medium"}</strong>
              </div>
              <div>
                <span className="meta-label">Duration:</span>{" "}
                <strong>{quizPreview.duration} Minutes</strong>
              </div>
              <div>
                <span className="meta-label">Questions:</span>{" "}
                <strong>{quizPreview.questionCount} Questions</strong>
              </div>
            </div>

            <div className="preview-rules">
              <p>⚠️ <strong>Important Rules:</strong></p>
              <ul>
                <li>The countdown timer starts as soon as you click "Begin Quiz".</li>
                <li>The backend enforces the time limit; answers automatically submit at 00:00.</li>
                <li>You can only submit once. Multiple attempts are blocked.</li>
              </ul>
            </div>

            <button onClick={handleStartQuiz} className="btn-primary mt-4">
              Begin Quiz Now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
