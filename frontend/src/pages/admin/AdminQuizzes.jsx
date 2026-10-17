import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Copy,
  Check,
  Trophy,
  Trash2,
  AlertTriangle
} from "lucide-react";
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
      .then((data) => setQuizzes(data || []))
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
    <div className="container" style={{ marginTop: "24px" }}>
      {/* Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
            <Sparkles size={13} />
            <span>Curriculum Management</span>
          </div>
          <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "4px" }}>
            Manage Created Quizzes
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Review access codes, inspect submissions, and manage quiz availability.
          </p>
        </div>

        <Link to="/admin/create-quiz" className="btn-primary">
          <Plus size={16} />
          Create New Quiz
        </Link>
      </div>

      {error && <div className="alert-box alert-error" style={{ marginBottom: "16px" }}>{error}</div>}

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading quiz records…</p>
        </div>
      )}

      {!loading && quizzes.length === 0 && (
        <div className="card-modern" style={{ padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            No quizzes authored yet.
          </p>
          <Link to="/admin/create-quiz" className="btn-primary">
            <Plus size={15} /> Create Your First Quiz
          </Link>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="card-modern" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title & Category</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Access Code</th>
                  <th>Duration</th>
                  <th>Submissions</th>
                  <th>Avg. Score</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>
                      <strong style={{ color: "var(--text)", display: "block" }}>
                        {q.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {q.category} &bull; <span style={{ textTransform: "capitalize" }}>{q.difficulty}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`visibility-pill visibility-${q.visibility}`}>
                        {q.visibility === "private" ? "Private" : "Public"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${q.status}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span className="code-pill">{q.quizCode}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(q.quizCode)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            color: copiedCode === q.quizCode ? "var(--easy)" : "var(--text-muted)",
                          }}
                          title="Copy quiz code"
                        >
                          {copiedCode === q.quizCode ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{q.duration} min</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{q.participantCount}</span>
                    </td>
                    <td>
                      <span
                        className="badge-tag"
                        style={{
                          background:
                            q.avgScore >= 75
                              ? "rgba(63, 125, 88, 0.12)"
                              : q.avgScore >= 50
                              ? "rgba(183, 121, 31, 0.12)"
                              : "rgba(178, 58, 58, 0.12)",
                          color:
                            q.avgScore >= 75
                              ? "var(--easy)"
                              : q.avgScore >= 50
                              ? "var(--medium)"
                              : "var(--hard)",
                        }}
                      >
                        {q.avgScore}%
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link
                          to={`/admin/results/${q._id}`}
                          className="btn-secondary-sm"
                          title="View submissions"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-secondary-sm"
                          title="Leaderboard"
                        >
                          <Trophy size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setQuizToDelete(q)}
                          className="btn-secondary-sm"
                          style={{ color: "var(--hard)" }}
                          title="Delete quiz"
                        >
                          <Trash2 size={13} />
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
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-btn)",
                background: "rgba(178, 58, 58, 0.12)",
                color: "var(--hard)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ fontSize: "19px", color: "var(--text)", marginBottom: "8px" }}>
              Delete "{quizToDelete.title}"?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.5, marginBottom: "14px" }}>
              This will permanently delete this quiz, associated questions,{" "}
              <strong>{quizToDelete.participantCount}</strong> candidate submission records, and its official
              leaderboard history.
            </p>
            <p style={{ color: "var(--hard)", fontSize: "13px", fontWeight: 600, marginBottom: "20px" }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
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
                className="btn-primary"
                style={{ background: "var(--hard)", borderColor: "var(--hard)" }}
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
