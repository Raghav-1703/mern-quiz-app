import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Shield,
  Crown,
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  Trophy,
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
      .then((data) => setResults(data || []))
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
    <div className="container" style={{ maxWidth: "860px", marginTop: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
          <Sparkles size={13} />
          <span>Account & Profile</span>
        </div>
        <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "4px" }}>
          Student Profile
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Manage your account information and examine past assessment submissions.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div
        className="card-modern"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Avatar initial */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-btn)",
              background: "var(--primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 style={{ fontSize: "20px", color: "var(--text)", marginBottom: "2px" }}>
              {user?.name || "Participant"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className={`role-pill ${user?.role === "admin" ? "role-admin" : "role-user"}`}>
                {user?.role === "admin" ? "Administrator" : "Student Participant"}
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
            >
              <Crown size={15} color="var(--primary)" />
              {upgrading ? "Upgrading…" : "Upgrade to Admin"}
            </button>
          ) : (
            <Link to="/admin/dashboard" className="btn-primary">
              <LayoutDashboard size={15} />
              Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="stats-cards-row">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <BookOpen size={20} />
          </div>
          <div className="stat-info-col">
            <div className="stat-value">{totalQuizzes}</div>
            <div className="stat-label-text">Quizzes Completed</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Award size={20} />
          </div>
          <div className="stat-info-col">
            <div className="stat-value">{avgScore}%</div>
            <div className="stat-label-text">Average Score</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info-col">
            <div className="stat-value">
              {totalCorrect} <span style={{ fontSize: "15px", color: "var(--text-muted)", fontWeight: 400 }}>/ {totalQuestions}</span>
            </div>
            <div className="stat-label-text">Questions Mastered</div>
          </div>
        </div>
      </div>

      {/* Attempt History Table Card */}
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
          <h3 style={{ fontSize: "17px", color: "var(--text)" }}>
            Complete Assessment History
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {results.length} Attempt{results.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading history…</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
              No quiz attempts recorded yet.
            </p>
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
                      <strong style={{ color: "var(--text)" }}>{r.quiz?.title || "Quiz Evaluation"}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{r.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}> / {r.totalMarks}</span>
                    </td>
                    <td>
                      <span
                        className="badge-tag"
                        style={{
                          background:
                            r.percentage >= 80
                              ? "rgba(63, 125, 88, 0.12)"
                              : r.percentage >= 50
                              ? "rgba(183, 121, 31, 0.12)"
                              : "rgba(178, 58, 58, 0.12)",
                          color:
                            r.percentage >= 80
                              ? "var(--easy)"
                              : r.percentage >= 50
                              ? "var(--medium)"
                              : "var(--hard)",
                        }}
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
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link
                          to={`/result/${r._id}`}
                          className="btn-secondary-sm"
                        >
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link
                            to={`/leaderboard/${r.quiz._id}`}
                            className="btn-secondary-sm"
                            title="View Leaderboard"
                          >
                            <Trophy size={12} />
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
