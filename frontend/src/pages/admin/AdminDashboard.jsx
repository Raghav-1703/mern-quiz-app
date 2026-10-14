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
  ExternalLink,
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
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "1080px" }}>
      {/* Top Banner */}
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
            <Sparkles size={14} /> Educator Studio & Management
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "6px" }}>
            Educator Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Create structured quizzes, distribute access codes to candidates, and monitor real-time submissions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to="/admin/create-quiz"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={18} />
            Create New Quiz
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-number">{totalQuizzes}</div>
          <div className="stat-title">Quizzes Published</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--amber-light)", color: "#b45309" }}>
            <Users size={24} />
          </div>
          <div className="stat-number">{totalParticipants}</div>
          <div className="stat-title">Total Submissions</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--green-light)", color: "#15803d" }}>
            <HelpCircle size={24} />
          </div>
          <div className="stat-number">{totalQuestions}</div>
          <div className="stat-title">Questions Authored</div>
        </div>
      </div>

      {/* Quizzes Management Card */}
      <div className="card-modern">
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>
              Authored Quizzes & Active Codes
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Share access codes with your students to permit exam entry.
            </p>
          </div>

          <Link
            to="/admin/quizzes"
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            Manage All <ChevronRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="state-msg-container">
            <div className="spinner" />
            <p className="state-msg">Loading your created quizzes…</p>
          </div>
        )}

        {error && <div className="alert-box alert-error" style={{ margin: "20px" }}>{error}</div>}

        {!loading && quizzes.length === 0 && (
          <div style={{ padding: "64px 32px", textAlign: "center" }}>
            <ClipboardList size={48} color="var(--primary)" style={{ opacity: 0.35, marginBottom: "16px" }} />
            <h3 style={{ fontSize: "18px", color: "var(--text-heading)", marginBottom: "8px" }}>
              No Quizzes Authored Yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              Get started by drafting your first quiz with custom questions and timer settings.
            </p>
            <Link to="/admin/create-quiz" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Plus size={18} />
              Create Your First Quiz Now
            </Link>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title & Category</th>
                  <th>Access Code</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Submissions</th>
                  <th>Avg. Score</th>
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
                          title="Copy quiz access code"
                        >
                          {copiedCode === q.quizCode ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{q.duration} min</td>
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
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Link
                          to={`/admin/results/${q._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          title="View all candidate submissions"
                        >
                          Submissions
                        </Link>
                        <Link
                          to={`/leaderboard/${q._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          title="View leaderboard"
                        >
                          <Trophy size={12} /> Rank
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
