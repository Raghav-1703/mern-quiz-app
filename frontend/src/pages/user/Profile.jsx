import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchMyResults } from "../../services/resultService.js";

export default function Profile() {
  const { user, becomeAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults()
      .then((data) => setResults(data))
      .catch((err) => console.error("Error loading profile history:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalQuizzes = results.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalQuizzes)
      : 0;
  const totalCorrect = results.reduce((acc, r) => acc + (r.correctAnswers || 0), 0);
  const totalQuestions = results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);

  return (
    <div className="container profile-container">
      <div className="eyebrow">User Profile</div>
      <h1 className="hero-title">Account & Activity</h1>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="profile-details">
          <h2>{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-tags">
            <span className={`role-pill ${user?.role === "admin" ? "role-admin" : "role-user"}`}>
              {user?.role === "admin" ? "Administrator" : "Student Participant"}
            </span>
            <span className="join-date">Member since 2026</span>
            {user?.role !== "admin" && (
              <button
                type="button"
                className="btn-secondary-sm"
                onClick={async () => {
                  if (window.confirm("Upgrade your account to Administrator?")) {
                    await becomeAdmin();
                    window.location.reload();
                  }
                }}
              >
                👑 Upgrade to Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="stats-row mt-6">
        <div className="stat-card">
          <div className="stat-number">{totalQuizzes}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {totalCorrect} / {totalQuestions}
          </div>
          <div className="stat-label">Total Correct Questions</div>
        </div>
      </div>

      {/* Full History */}
      <div className="dash-card mt-6">
        <div className="dash-card-header">
          <h3>Full Attempt History</h3>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p className="state-msg">Loading history…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p className="state-msg">No test attempts recorded yet.</p>
            <Link to="/join-quiz" className="btn-primary">
              Join a Quiz Now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Quiz Code</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td className="font-bold">{r.quiz?.title || "Quiz"}</td>
                    <td>
                      <span className="code-pill">{r.quiz?.quizCode || "—"}</span>
                    </td>
                    <td>
                      {r.score} / {r.totalMarks}
                    </td>
                    <td>
                      <span className="status-pill status-success">{r.percentage}%</span>
                    </td>
                    <td>{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</td>
                    <td className="text-muted">
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="btn-group-sm">
                        <Link to={`/result/${r._id}`} className="btn-table-action">
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link
                            to={`/leaderboard/${r.quiz._id}`}
                            className="btn-table-action"
                          >
                            Leaderboard
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
