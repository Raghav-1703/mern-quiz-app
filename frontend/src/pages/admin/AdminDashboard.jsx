import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Plus,
  BookOpen,
  Users,
  HelpCircle,
  Copy,
  Check,
  Trophy,
  ChevronRight,
  ClipboardList
} from "lucide-react";
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
      .then((data) => setQuizzes(data || []))
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
    <div className="container" style={{ marginTop: "24px" }}>
      {/* Top Banner */}
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
            <span>Admin & Educator Portal</span>
          </div>
          <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "4px" }}>
            Educator Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Author quizzes, set private access codes, configure availability deadlines, and inspect submissions.
          </p>
        </div>

        <Link to="/admin/create-quiz" className="btn-primary">
          <Plus size={16} />
          Create New Quiz
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="stats-cards-row">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <BookOpen size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{totalQuizzes}</span>
            <span className="stat-label-text">Quizzes Authored</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Users size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{totalParticipants}</span>
            <span className="stat-label-text">Total Submissions</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <HelpCircle size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{totalQuestions}</span>
            <span className="stat-label-text">Questions Created</span>
          </div>
        </div>
      </div>

      {/* Quizzes Table Card */}
      <div className="card-modern" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "17px", color: "var(--text)" }}>
              Authored Quizzes
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Manage visibility, access codes, and monitor participant attempts.
            </p>
          </div>

          <Link to="/admin/quizzes" className="btn-secondary-sm">
            Manage All <ChevronRight size={13} />
          </Link>
        </div>

        {loading && (
          <div className="state-msg-container">
            <div className="spinner" />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading your created quizzes…</p>
          </div>
        )}

        {error && <div className="alert-box alert-error" style={{ margin: "16px" }}>{error}</div>}

        {!loading && quizzes.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ClipboardList size={36} color="var(--primary)" style={{ opacity: 0.4, marginBottom: "12px" }} />
            <h3 style={{ fontSize: "17px", color: "var(--text)", marginBottom: "6px" }}>
              No Quizzes Authored Yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              Get started by drafting your first quiz with custom questions and timer settings.
            </p>
            <Link to="/admin/create-quiz" className="btn-primary">
              <Plus size={16} /> Create Your First Quiz
            </Link>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
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
                          title="Copy quiz access code"
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
                          title="View all submissions"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-secondary-sm"
                          title="View leaderboard"
                        >
                          <Trophy size={12} />
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
