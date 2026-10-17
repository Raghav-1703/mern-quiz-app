import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Clock,
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

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--accent)",
            color: "var(--text)",
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          1st Place
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
            background: "var(--border)",
            color: "var(--text)",
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          2nd Place
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
            background: "#FCE7C8",
            color: "#9A3412",
            padding: "3px 8px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: "12px",
          }}
        >
          3rd Place
        </span>
      );
    }
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        #{rank}
      </span>
    );
  };

  return (
    <div className="container" style={{ maxWidth: "860px", marginTop: "24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-btn)",
            background: "var(--accent)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Trophy size={24} />
        </div>
        <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "6px" }}>
          {data?.quiz?.title || "Quiz Leaderboard"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "520px", margin: "0 auto" }}>
          Rankings are calculated dynamically by score, with completion speed as the tiebreaker.
        </p>
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading leaderboard standings…</p>
        </div>
      )}

      {error && (
        <div className="card-modern text-center" style={{ padding: "32px 20px" }}>
          <p style={{ color: "var(--hard)", fontSize: "15px", marginBottom: "16px" }}>{error}</p>
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
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
              <Users size={16} color="var(--primary)" />
              {data.totalParticipants} Candidate{data.totalParticipants === 1 ? "" : "s"} Ranked
            </div>

            <Link
              to={`/quiz/${quizId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--primary)",
              }}
            >
              Take Quiz <ExternalLink size={13} />
            </Link>
          </div>

          {/* Table Card */}
          <div className="card-modern" style={{ padding: 0, overflow: "hidden", marginBottom: "28px" }}>
            {data.leaderboard.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
                  No submissions recorded for this quiz yet.
                </p>
                <Link to={`/quiz/${quizId}`} className="btn-primary">
                  Be the First to Take It
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: "110px" }}>Rank</th>
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
                            background: isCurrentUser ? "var(--primary-soft)" : undefined,
                          }}
                        >
                          <td>{getRankBadge(entry.rank)}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                                {entry.playerName}
                              </span>
                              {isCurrentUser && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    background: "var(--primary)",
                                    color: "#FFFFFF",
                                    padding: "1px 6px",
                                    borderRadius: "var(--radius-sm)",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "var(--text)" }}>
                              {entry.score}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                              {" "} / {entry.totalMarks}
                            </span>
                          </td>
                          <td>
                            <span
                              className="badge-tag"
                              style={{
                                background:
                                  entry.percentage >= 80
                                    ? "rgba(63, 125, 88, 0.12)"
                                    : entry.percentage >= 50
                                    ? "rgba(183, 121, 31, 0.12)"
                                    : "rgba(178, 58, 58, 0.12)",
                                color:
                                  entry.percentage >= 80
                                    ? "var(--easy)"
                                    : entry.percentage >= 50
                                    ? "var(--medium)"
                                    : "var(--hard)",
                              }}
                            >
                              {entry.percentage}%
                            </span>
                          </td>
                          <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                            {formatTime(entry.timeTaken)}
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

          {/* Navigation Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <Link to="/dashboard" className="btn-primary">
              <LayoutDashboard size={16} />
              Return to Dashboard
            </Link>
            <Link to="/" className="btn-secondary">
              Explore More Quizzes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
