import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Copy,
  Check,
  Trophy,
  Users,
  Trash2,
  Clock,
  ExternalLink,
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
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "1080px" }}>
      {/* Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "32px"
        }}
      >
        <div>
          <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <Sparkles size={14} /> Curriculum Inventory
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "6px" }}>
            Manage Created Quizzes
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Inspect access codes, view candidate submissions, or manage test availability.
          </p>
        </div>

        <Link
          to="/admin/create-quiz"
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} />
          Create New Quiz
        </Link>
      </div>

      {error && <div className="alert-box alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading quiz records…</p>
        </div>
      )}

      {!loading && quizzes.length === 0 && (
        <div className="card-modern" style={{ padding: "64px 32px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "24px" }}>
            No quizzes authored yet.
          </p>
          <Link to="/admin/create-quiz" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} /> Create Your First Quiz
          </Link>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="card-modern">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title & Category</th>
                  <th>Access Code</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Submissions</th>
                  <th>Avg. Score</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>
                      <strong style={{ color: "var(--text-heading)", fontSize: "15px", display: "block" }}>
                        {q.title}
                      </strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "inline-block", marginTop: "2px" }}>
                        {q.category} • <span style={{ textTransform: "capitalize" }}>{q.difficulty}</span>
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
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            color: copiedCode === q.quizCode ? "var(--green)" : "var(--text-dim)"
                          }}
                          title="Copy quiz code"
                        >
                          {copiedCode === q.quizCode ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{q.duration} min</td>
                    <td style={{ fontWeight: 600, color: "var(--text-heading)" }}>{q.questionCount}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: "var(--primary-light)",
                          color: "var(--primary)"
                        }}
                      >
                        <Users size={12} /> {q.participantCount}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          q.avgScore >= 75
                            ? "status-success"
                            : q.avgScore >= 50
                            ? "status-warning"
                            : "status-danger"
                        }`}
                      >
                        {q.avgScore}%
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Link
                          to={`/admin/results/${q._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          title="View all participant submissions"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          title="Leaderboard"
                        >
                          <Trophy size={12} /> Rank
                        </Link>
                        <button
                          type="button"
                          onClick={() => setQuizToDelete(q)}
                          style={{
                            padding: "6px 10px",
                            fontSize: "12px",
                            background: "var(--coral-light)",
                            color: "var(--coral)",
                            border: "1px solid #fecdd3",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
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
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--coral-light)",
                color: "var(--coral)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
              Delete "{quizToDelete.title}"?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.5, marginBottom: "16px" }}>
              This will permanently delete this quiz, all associated questions,{" "}
              <strong>{quizToDelete.participantCount}</strong> candidate submission records, and its official
              leaderboard history.
            </p>
            <p style={{ color: "var(--coral)", fontSize: "13px", fontWeight: 700, marginBottom: "24px" }}>
              ⚠️ This action cannot be reversed.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
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
                style={{ background: "var(--coral)", border: "none" }}
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
