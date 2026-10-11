import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuizzes, joinQuizByCode } from "../services/quizService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [quizCodeInput, setQuizCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes()
      .then((data) => {
        setQuizzes(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Fetch quizzes failed:", err);
        setStatus("error");
      });
  }, []);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!quizCodeInput.trim()) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/join-quiz&code=${quizCodeInput.trim().toUpperCase()}`);
      return;
    }

    setJoining(true);
    setJoinError("");
    try {
      const data = await joinQuizByCode(quizCodeInput.trim());
      if (data.alreadySubmitted) {
        navigate(`/result/${data.resultId}`);
      } else {
        navigate(`/quiz/${data.quizId}`);
      }
    } catch (err) {
      setJoinError(
        err.response?.data?.message || "Invalid quiz code. Please double-check and retry."
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="container">
      <div className="hero-section">
        <div className="eyebrow">Interactive Testing Platform</div>
        <h1 className="hero-title">Step into the spotlight.</h1>
        <p className="hero-sub">
          Enter an access code or choose from featured quizzes. Beat the real-time clock,
          submit your answers securely, and climb to the top of the leaderboard.
        </p>

        {/* Quick Quiz Code Join System */}
        <div className="code-join-hero">
          <form className="join-code-form" onSubmit={handleJoinByCode}>
            <input
              type="text"
              className="code-input"
              placeholder="Enter Quiz Code (e.g. MERN4821)"
              value={quizCodeInput}
              onChange={(e) => {
                setQuizCodeInput(e.target.value.toUpperCase());
                setJoinError("");
              }}
              maxLength={12}
            />
            <button type="submit" className="btn-join" disabled={joining}>
              {joining ? "Validating…" : "Join Quiz →"}
            </button>
          </form>
          {joinError && <p className="join-error-msg">{joinError}</p>}
        </div>

        {isAuthenticated && isAdmin && (
          <div className="admin-banner">
            <span>You are signed in as an Administrator.</span>
            <Link to="/admin/dashboard" className="btn-secondary-sm">
              Open Admin Dashboard →
            </Link>
          </div>
        )}
      </div>

      <div className="section-header">
        <h2 className="section-title">Available Quizzes</h2>
        <span className="section-badge">{quizzes.length} Live Tests</span>
      </div>

      {status === "loading" && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading quizzes…</p>
        </div>
      )}

      {status === "error" && (
        <div className="alert-box alert-error">
          Couldn't connect to server. Ensure the backend API is running on port 5000.
        </div>
      )}

      {status === "ready" && quizzes.length === 0 && (
        <div className="empty-state">
          <p className="state-msg">No quizzes created yet.</p>
          {isAdmin && (
            <Link to="/admin/create-quiz" className="btn-primary">
              Create the First Quiz
            </Link>
          )}
        </div>
      )}

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div className="quiz-card" key={quiz._id}>
            <div className="tag-row">
              <span className="tag category-tag">{quiz.category}</span>
              <span className={`tag difficulty-${quiz.difficulty}`}>{quiz.difficulty}</span>
              <span className="tag code-tag">CODE: {quiz.quizCode}</span>
            </div>

            <h3 className="quiz-card-title">{quiz.title}</h3>
            <p className="quiz-card-desc">{quiz.description}</p>

            <div className="quiz-card-meta">
              <span>⏱️ {quiz.duration} min duration</span>
              <span>📝 {quiz.questionCount} questions</span>
            </div>

            <div className="quiz-card-actions">
              <Link to={`/quiz/${quiz._id}`} className="btn-card-take">
                Start Quiz
              </Link>
              <Link to={`/leaderboard/${quiz._id}`} className="btn-card-leaderboard" title="View Leaderboard">
                🏆 Leaderboard
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
