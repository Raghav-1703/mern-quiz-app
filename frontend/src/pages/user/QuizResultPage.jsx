import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchResultById } from "../../services/resultService.js";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <p className="state-msg">Calculating official score and performance breakdown…</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container">
        <div className="alert-box alert-error">
          <h3>Result Not Found</h3>
          <p>{error || "Could not retrieve results for this attempt."}</p>
          <Link to="/dashboard" className="btn-secondary mt-4">
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

  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference * (1 - (result.percentage || 0) / 100);

  return (
    <div className="container result-page-container">
      {/* Result Hero Header */}
      <div className="result-hero-box">
        <div className="eyebrow">Official Results</div>
        <h1 className="hero-title">Quiz Completed!</h1>
        <p className="hero-sub">{result.quiz?.title || "Quiz Evaluation"}</p>

        {/* Score Ring */}
        <div className="score-ring-wrap">
          <svg className="score-ring-svg" width="160" height="160" viewBox="0 0 160 160">
            <circle className="score-ring-bg" cx="80" cy="80" r="72" />
            <circle
              className="score-ring-fg"
              cx="80"
              cy="80"
              r="72"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="score-ring-center">
            <span className="score-big">{result.score}</span>
            <span className="score-total">/ {result.totalMarks}</span>
            <span className="score-percent">{result.percentage}%</span>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-icon text-success">✓</span>
            <div className="metric-info">
              <span className="metric-val">{result.correctAnswers}</span>
              <span className="metric-lbl">Correct</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon text-danger">✗</span>
            <div className="metric-info">
              <span className="metric-val">{result.incorrectAnswers}</span>
              <span className="metric-lbl">Incorrect</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon text-warning">⏱️</span>
            <div className="metric-info">
              <span className="metric-val">{formatTime(result.timeTaken)}</span>
              <span className="metric-lbl">Time Taken</span>
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-icon text-muted">📊</span>
            <div className="metric-info">
              <span className="metric-val">{result.totalQuestions}</span>
              <span className="metric-lbl">Questions</span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="result-actions-row">
          {result.quiz?._id && (
            <Link to={`/leaderboard/${result.quiz._id}`} className="btn-primary">
              🏆 View Leaderboard
            </Link>
          )}
          <Link to="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Detailed Question Review */}
      {result.answers && result.answers.length > 0 && (
        <div className="review-section">
          <h2 className="review-heading">Question Review & Explanations</h2>

          <div className="review-list">
            {result.answers.map((item, idx) => {
              const isCorrect = item.isCorrect;
              const answered = item.selectedAnswer !== null && item.selectedAnswer !== undefined;

              return (
                <div
                  key={idx}
                  className={`review-card ${isCorrect ? "card-correct" : "card-incorrect"}`}
                >
                  <div className="review-card-top">
                    <span className="review-q-num">Question {idx + 1}</span>
                    <span
                      className={`badge-result ${isCorrect ? "badge-correct" : "badge-incorrect"}`}
                    >
                      {isCorrect ? "Correct (+1)" : answered ? "Incorrect" : "Unanswered"}
                    </span>
                  </div>

                  <h3 className="review-q-title">{item.questionText}</h3>

                  <div className="review-options">
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selectedAnswer === optIdx;
                      const isCorrectChoice = item.correctAnswer === optIdx;

                      let optClass = "review-opt";
                      if (isCorrectChoice) optClass += " opt-correct";
                      if (isUserChoice && !isCorrect) optClass += " opt-wrong";

                      return (
                        <div key={optIdx} className={optClass}>
                          <span className="opt-letter">{OPTION_LABELS[optIdx]}</span>
                          <span className="opt-text">{opt}</span>
                          {isCorrectChoice && <span className="opt-tag tag-answer">Correct Answer</span>}
                          {isUserChoice && !isCorrect && (
                            <span className="opt-tag tag-chosen">Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="explanation-box">
                      <strong>Explanation:</strong> {item.explanation}
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
