import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Medal,
  Award,
  Users,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";
import { fetchLeaderboard } from "../../services/resultService.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function QuizLeaderboard() {
  const { quizId } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchLeaderboard(quizId)
      .then((res) => setData(res))
      .catch((err) => {
        console.error("Leaderboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load leaderboard.");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#FEF3C7",
            color: "#B45309",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            fontWeight: 800,
            fontSize: "13px"
          }}
        >
          🥇 1st Place
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#F1F5F9",
            color: "#475569",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            fontWeight: 800,
            fontSize: "13px"
          }}
        >
          🥈 2nd Place
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#FFEDD5",
            color: "#C2410C",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            fontWeight: 800,
            fontSize: "13px"
          }}
        >
          🥉 3rd Place
        </span>
      );
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "var(--surface-raised)",
          color: "var(--text-muted)",
          fontWeight: 700,
          fontSize: "13px"
        }}
      >
        #{rank}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <Trophy size={14} /> Official Leaderboard & Rankings
        </div>
        <h1 style={{ fontSize: "34px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
          {data?.quiz?.title || "Quiz Leaderboard"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "560px", margin: "0 auto 18px" }}>
          Rankings are calculated dynamically by highest score, with fastest completion speed as the tiebreaker.
        </p>

        {data?.quiz?.quizCode && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-full)", padding: "4px 12px 4px 16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Quiz Code:
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--primary)" }}>
              {data.quiz.quizCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(data.quiz.quizCode)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                color: copiedCode ? "var(--green)" : "var(--text-dim)"
              }}
              title="Copy code"
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading official leaderboard standings…</p>
        </div>
      )}

      {error && (
        <div className="card-modern text-center" style={{ padding: "40px 32px" }}>
          <p style={{ color: "var(--coral)", fontSize: "16px", marginBottom: "20px" }}>{error}</p>
          <Link to="/dashboard" className="btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          {/* Top Info Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
              padding: "0 4px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "var(--text-heading)" }}>
              <Users size={18} color="var(--primary)" />
              {data.totalParticipants} Candidate{data.totalParticipants === 1 ? "" : "s"} Ranked
            </div>

            <Link
              to={`/quiz/${quizId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--primary)",
                textDecoration: "none"
              }}
            >
              Attempt / Retake Quiz <ExternalLink size={14} />
            </Link>
          </div>

          {/* Table Card */}
          <div className="card-modern" style={{ overflow: "hidden", marginBottom: "32px" }}>
            {data.leaderboard.length === 0 ? (
              <div style={{ padding: "64px 32px", textAlign: "center" }}>
                <Trophy size={48} color="var(--primary)" style={{ opacity: 0.35, marginBottom: "16px" }} />
                <h3 style={{ fontSize: "18px", color: "var(--text-heading)", marginBottom: "8px" }}>
                  No Submissions Recorded Yet
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  Be the very first candidate to take this quiz and claim the #1 spot!
                </p>
                <Link to={`/quiz/${quizId}`} className="btn-primary">
                  Start Quiz Now
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: "120px" }}>Rank</th>
                      <th>Candidate</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Time Taken</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.map((entry) => {
                      const isCurrentUser =
                        user && entry.userId && String(entry.userId) === String(user._id);

                      return (
                        <tr
                          key={entry.resultId || entry.rank}
                          style={{
                            background: isCurrentUser ? "#FAF5FF" : undefined
                          }}
                        >
                          <td>{getRankBadge(entry.rank)}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                                {entry.playerName}
                              </span>
                              {isCurrentUser && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    border: "1px solid var(--border-purple)",
                                    padding: "2px 8px",
                                    borderRadius: "var(--radius-full)"
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "15px" }}>
                              {entry.score}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                              {" "}/ {entry.totalMarks}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                entry.percentage >= 80
                                  ? "status-success"
                                  : entry.percentage >= 50
                                  ? "status-warning"
                                  : "status-danger"
                              }`}
                            >
                              {entry.percentage}%
                            </span>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                              <Clock size={14} color="var(--text-dim)" />
                              {formatTime(entry.timeTaken)}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            {new Date(entry.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link
              to="/dashboard"
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <LayoutDashboard size={18} />
              Return to Dashboard
            </Link>
            <Link
              to="/"
              className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Explore More Quizzes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
