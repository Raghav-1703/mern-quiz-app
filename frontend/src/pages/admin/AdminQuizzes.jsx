import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminQuizzes, deleteQuiz } from "../../services/quizService.js";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const loadQuizzes = () => {
    setLoading(true);
    fetchAdminQuizzes()
      .then((data) => setQuizzes(data))
      .catch((err) => {
        console.error("Failed to load admin quizzes:", err);
        setError("Unable to load quizzes.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setDeletingId(quizToDelete._id);
    try {
      await deleteQuiz(quizToDelete._id);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizToDelete._id));
      setQuizToDelete(null);
    } catch (err) {
      console.error("Delete quiz error:", err);
      setError("Failed to delete quiz.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container admin-container">
      <div className="admin-banner-header">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1 className="hero-title">Manage Created Quizzes</h1>
          <p className="hero-sub">
            Review test codes, monitor attempts, or remove retired questionnaires.
          </p>
        </div>
        <Link to="/admin/create-quiz" className="btn-primary">
          + Create New Quiz
        </Link>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading quiz records…</p>
        </div>
      )}

      {!loading && quizzes.length === 0 && (
        <div className="empty-state">
          <p className="state-msg">No quizzes authored yet.</p>
          <Link to="/admin/create-quiz" className="btn-primary">
            Create Your First Quiz
          </Link>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="dash-card mt-6">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title & Category</th>
                  <th>Quiz Code</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Participants</th>
                  <th>Avg. Score</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>
                      <strong>{q.title}</strong>
                      <div className="tag-row mt-1">
                        <span className="tag category-tag">{q.category}</span>
                        <span className={`tag difficulty-${q.difficulty}`}>{q.difficulty}</span>
                      </div>
                    </td>
                    <td>
                      <div className="code-copy-wrap">
                        <span className="code-pill font-mono">{q.quizCode}</span>
                        <button
                          type="button"
                          className="btn-copy-code"
                          onClick={() => copyCode(q.quizCode)}
                          title="Copy quiz code"
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
                    <td className="text-muted">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="btn-group-sm">
                        <Link
                          to={`/admin/results/${q._id}`}
                          className="btn-table-action"
                          title="View participants & submissions"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-table-action"
                          title="Leaderboard"
                        >
                          Leaderboard
                        </Link>
                        <button
                          type="button"
                          className="btn-table-del"
                          onClick={() => setQuizToDelete(q)}
                          title="Delete quiz"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete "{quizToDelete.title}"?</h3>
            <p>
              This will permanently delete this quiz, its question bank, all{" "}
              <strong>{quizToDelete.participantCount}</strong> participant submission records, and its
              leaderboard history.
            </p>
            <p className="modal-warning">⚠️ This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setQuizToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
