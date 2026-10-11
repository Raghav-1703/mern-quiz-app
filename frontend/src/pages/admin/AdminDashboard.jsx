import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminQuizzes } from "../../services/quizService.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    fetchAdminQuizzes()
      .then((data) => setQuizzes(data))
      .catch((err) => {
        console.error("Failed to load admin quizzes:", err);
        setError("Unable to load administrative overview.");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalQuizzes = quizzes.length;
  const totalParticipants = quizzes.reduce((sum, q) => sum + (q.participantCount || 0), 0);
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="container admin-container">
      {/* Top Banner */}
      <div className="admin-banner-header">
        <div>
          <div className="eyebrow">Administrative Portal</div>
          <h1 className="hero-title">Educator Dashboard</h1>
          <p className="hero-sub">
            Create structured quizzes, distribute codes, and inspect participant analytics.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/create-quiz" className="btn-primary">
            + Create New Quiz
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{totalQuizzes}</div>
          <div className="stat-label">Total Quizzes Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalParticipants}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalQuestions}</div>
          <div className="stat-label">Total Questions Authored</div>
        </div>
      </div>

      {/* Quizzes Management Card */}
      <div className="dash-card mt-6">
        <div className="dash-card-header">
          <h3>Your Quizzes & Access Codes</h3>
          <Link to="/admin/create-quiz" className="btn-link">
            + New Quiz
          </Link>
        </div>

        {loading && (
          <div className="state-msg-container">
            <div className="spinner" />
            <p className="state-msg">Loading your created quizzes…</p>
          </div>
        )}

        {error && <div className="alert-box alert-error">{error}</div>}

        {!loading && quizzes.length === 0 && (
          <div className="empty-state">
            <p className="state-msg">You haven't authored any quizzes yet.</p>
            <Link to="/admin/create-quiz" className="btn-primary">
              Create Your First Quiz Now
            </Link>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Access Code</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Participants</th>
                  <th>Avg. Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>
                      <strong>{q.title}</strong>
                      <span className="block-category text-muted">{q.category}</span>
                    </td>
                    <td>
                      <div className="code-copy-wrap">
                        <span className="code-pill font-mono">{q.quizCode}</span>
                        <button
                          type="button"
                          className="btn-copy-code"
                          onClick={() => copyCode(q.quizCode)}
                          title="Copy Quiz Code"
                        >
                          {copiedCode === q.quizCode ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td>{q.duration} min</td>
                    <td>{q.questionCount}</td>
                    <td>
                      <span className="badge-participant">{q.participantCount}</span>
                    </td>
                    <td>{q.avgScore}%</td>
                    <td>
                      <div className="btn-group-sm">
                        <Link
                          to={`/admin/results/${q._id}`}
                          className="btn-table-action"
                          title="View all participant scores"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-table-action"
                          title="View leaderboard"
                        >
                          Leaderboard
                        </Link>
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
