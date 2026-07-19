import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { submitQuiz } from "../api/api.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function ResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location.state?.answers) {
      navigate(`/quiz/${id}`, { replace: true });
    }
  }, [location.state, id, navigate]);

  if (!location.state?.answers) return null;

  const handleSubmitName = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await submitQuiz(id, {
        playerName: playerName.trim(),
        answers: location.state.answers,
        timeTakenSeconds: location.state.timeTakenSeconds,
      });
      setResult(data);
    } catch (err) {
      setError("Couldn't submit your score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!result) {
    return (
      <div className="container">
        <div className="result-hero">
          <div className="eyebrow">Quiz complete</div>
          <h1 className="hero-title">Who's taking the stage?</h1>
          <p className="hero-sub" style={{ margin: "0 auto" }}>
            Enter a name to grade your answers and join the leaderboard.
          </p>
        </div>
        <form className="name-form" onSubmit={handleSubmitName}>
          <input
            placeholder="Your name"
            value={playerName}
            maxLength={40}
            onChange={(e) => setPlayerName(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Grading…" : "See my score"}
          </button>
        </form>
        {error && <p className="state-msg" style={{ textAlign: "center" }}>{error}</p>}
      </div>
    );
  }

  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - result.score / 100);

  return (
    <div className="container">
      <div className="result-hero">
        <div className="score-ring">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle className="track" cx="90" cy="90" r="80" />
            <circle
              className="progress"
              cx="90"
              cy="90"
              r="80"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="score-ring-label">
            <span className="big">{result.score}</span>
            <span className="small">SCORE</span>
          </div>
        </div>
        <h1 className="hero-title">
          {result.correctAnswers} / {result.totalQuestions} correct
        </h1>
        <p className="hero-sub" style={{ margin: "0 auto" }}>
          Nice work, {playerName}. Here's how each question played out.
        </p>
      </div>

      <div className="actions-row">
        <Link className="btn-secondary" to={`/quiz/${id}/leaderboard`}>
          View leaderboard
        </Link>
        <Link className="btn-secondary" to="/">
          Play another quiz
        </Link>
      </div>

      {result.breakdown.map((item, i) => (
        <div
          key={item.questionId}
          className={`review-item ${item.isCorrect ? "correct" : "incorrect"}`}
        >
          <div className="q-text">
            {i + 1}. {item.text}
          </div>
          <div className="answer-row">
            <span>
              Your answer:{" "}
              {item.selectedIndex === null || item.selectedIndex === -1
                ? "No answer"
                : `${LETTERS[item.selectedIndex]}. ${item.options[item.selectedIndex]}`}
            </span>
          </div>
          {!item.isCorrect && (
            <div className="answer-row">
              <span>
                Correct answer: {LETTERS[item.correctIndex]}. {item.options[item.correctIndex]}
              </span>
            </div>
          )}
          {item.explanation && <div className="explanation">{item.explanation}</div>}
        </div>
      ))}
    </div>
  );
}
