import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchQuizResults } from "../../services/resultService.js";
import { fetchQuizById } from "../../services/quizService.js";

export default function QuizResults() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchQuizResults(quizId), fetchQuizById(quizId)])
      .then(([resultsData, quizData]) => {
        setResults(resultsData);
        setQuiz(quizData);
      })
      .catch((err) => {
        console.error("Failed to load submissions:", err);
        setError("Unable to load submission records for this quiz.");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="container admin-container">
      <div className="admin-banner-header">
        <div>
          <div className="eyebrow">Participant Records</div>
          <h1 className="hero-title">{quiz?.title || "Quiz Submissions"}</h1>
          <p className="hero-sub">
            Review individual scores, completion speeds, and candidate responses.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to={`/leaderboard/${quizId}`} className="btn-primary">
            🏆 View Leaderboard
          </Link>
          <Link to="/admin/quizzes" className="btn-secondary">
            ← Back to Quizzes
          </Link>
        </div>
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading participant submissions…</p>
        </div>
      )}

      {error && <div className="alert-box alert-error">{error}</div>}

      {!loading && results.length === 0 && (
        <div className="empty-state">
          <p className="state-msg">No candidate has submitted this quiz yet.</p>
          <p className="subtext">
            Share the quiz code <strong>{quiz?.quizCode}</strong> with students to start receiving attempts.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="dash-card mt-6">
          <div className="dash-card-header">
            <h3>Total Submissions: {results.length}</h3>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Correct / Total</th>
                  <th>Time Taken</th>
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.user?.name || "Student"}</strong>
                    </td>
                    <td className="text-muted">{r.user?.email || "—"}</td>
                    <td>
                      {r.score} / {r.totalMarks}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          r.percentage >= 80
                            ? "status-success"
                            : r.percentage >= 50
                            ? "status-warning"
                            : "status-danger"
                        }`}
                      >
                        {r.percentage}%
                      </span>
                    </td>
                    <td>
                      {r.correctAnswers} / {r.totalQuestions}
                    </td>
                    <td>⏱️ {formatTime(r.timeTaken)}</td>
                    <td className="text-muted">
                      {new Date(r.submittedAt).toLocaleString()}
                    </td>
                    <td>
                      <Link to={`/result/${r._id}`} className="btn-table-action">
                        View Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
