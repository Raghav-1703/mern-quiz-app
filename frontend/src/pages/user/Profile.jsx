import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Crown,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Trophy,
  ExternalLink,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchMyResults } from "../../services/resultService.js";

export default function Profile() {
  const { user, becomeAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

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

  const handleUpgrade = async () => {
    if (window.confirm("Upgrade your account to Administrator? You will be able to create quizzes and manage access codes.")) {
      setUpgrading(true);
      try {
        await becomeAdmin();
        window.location.reload();
      } catch (err) {
        console.error("Failed to upgrade account:", err);
      } finally {
        setUpgrading(false);
      }
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <Sparkles size={14} /> Account & Learning Profile
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "6px" }}>
          Student Profile
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Track your overall performance trajectory and examine past assessment submissions.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div
        className="card-modern"
        style={{
          padding: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "32px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Avatar initial with gradient */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--primary-gradient)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
              boxShadow: "0 10px 20px var(--primary-glow)",
              flexShrink: 0
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "4px" }}>
              {user?.name || "Participant"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", marginBottom: "12px" }}>
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background: user?.role === "admin" ? "var(--primary-light)" : "var(--green-light)",
                  color: user?.role === "admin" ? "var(--primary)" : "#15803d",
                  border: `1px solid ${user?.role === "admin" ? "var(--border-purple)" : "#86efac"}`
                }}
              >
                {user?.role === "admin" ? <Crown size={14} /> : <Shield size={14} />}
                {user?.role === "admin" ? "Administrator" : "Student Candidate"}
              </span>

              <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {user?.role !== "admin" ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleUpgrade}
              disabled={upgrading}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Crown size={16} color="var(--primary)" />
              {upgrading ? "Upgrading…" : "Upgrade to Educator"}
            </button>
          ) : (
            <Link
              to="/admin/dashboard"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <LayoutDashboard size={16} />
              Educator Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="stat-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-number">{totalQuizzes}</div>
          <div className="stat-title">Quizzes Completed</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--amber-light)", color: "#b45309" }}>
            <Award size={24} />
          </div>
          <div className="stat-number">{avgScore}%</div>
          <div className="stat-title">Average Score</div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrap" style={{ background: "var(--green-light)", color: "#15803d" }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-number">
            {totalCorrect} <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>/ {totalQuestions}</span>
          </div>
          <div className="stat-title">Questions Mastered</div>
        </div>
      </div>

      {/* Attempt History Table Card */}
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
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>
            Complete Assessment History
          </h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
            {results.length} Attempt{results.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p className="state-msg">Loading history records…</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: "64px 32px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "20px" }}>
              You haven't completed any quizzes yet.
            </p>
            <Link to="/join-quiz" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Join a Quiz Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Access Code</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ color: "var(--text-heading)" }}>{r.quiz?.title || "Quiz Evaluation"}</strong>
                    </td>
                    <td>
                      <span className="code-pill">{r.quiz?.quizCode || "—"}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>{r.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}> / {r.totalMarks}</span>
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
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Link
                          to={`/result/${r._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link
                            to={`/leaderboard/${r.quiz._id}`}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Trophy size={12} /> Rank
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
