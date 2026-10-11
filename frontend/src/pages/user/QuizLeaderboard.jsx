import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
    if (rank === 1) return "🥇 1st";
    if (rank === 2) return "🥈 2nd";
    if (rank === 3) return "🥉 3rd";
    return `#${rank}`;
  };

  return (
    <div className="container leaderboard-container">
      <div className="leaderboard-header">
        <div className="eyebrow">Hall of Fame</div>
        <h1 className="hero-title">{data?.quiz?.title || "Quiz Leaderboard"}</h1>
        <p className="hero-sub">
          Official ranking sorted by score (primary) and completion time (tiebreaker).
        </p>
        {data?.quiz?.quizCode && (
          <span className="code-pill">CODE: {data.quiz.quizCode}</span>
        )}
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading official leaderboard rankings…</p>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <p>{error}</p>
          <Link to="/dashboard" className="btn-secondary mt-4">
            Return to Dashboard
          </Link>
        </div>
      )}

      {!loading && !error && data && (
        <div className="leaderboard-card">
          <div className="leaderboard-card-top">
            <span className="participant-count">
              👥 {data.totalParticipants} Participant{data.totalParticipants === 1 ? "" : "s"}
            </span>
            <Link to={`/quiz/${quizId}`} className="btn-link">
              View Quiz Details →
            </Link>
          </div>

          {data.leaderboard.length === 0 ? (
            <div className="empty-state">
              <p className="state-msg">No submissions recorded for this quiz yet.</p>
              <Link to={`/quiz/${quizId}`} className="btn-primary">
                Be the First to Take It!
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Participant</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((entry) => {
                    const isCurrentUser =
                      user && entry.userId && String(entry.userId) === String(user._id);

                    return (
                      <tr
                        key={entry.resultId || entry.rank}
                        className={isCurrentUser ? "row-highlight" : ""}
                      >
                        <td className="rank-cell">
                          <span
                            className={`rank-badge ${
                              entry.rank === 1
                                ? "rank-gold"
                                : entry.rank === 2
                                ? "rank-silver"
                                : entry.rank === 3
                                ? "rank-bronze"
                                : ""
                            }`}
                          >
                            {getRankBadge(entry.rank)}
                          </span>
                        </td>
                        <td className="player-cell">
                          <span className="player-name">{entry.playerName}</span>
                          {isCurrentUser && (
                            <span className="you-pill">You</span>
                          )}
                        </td>
                        <td className="score-cell">
                          <strong>{entry.score}</strong> / {entry.totalMarks}
                        </td>
                        <td>
                          <span className="accuracy-pill">{entry.percentage}%</span>
                        </td>
                        <td className="time-cell">
                          ⏱️ {formatTime(entry.timeTaken)}
                        </td>
                        <td className="date-cell text-muted">
                          {new Date(entry.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="leaderboard-footer-actions">
            <Link to="/dashboard" className="btn-secondary">
              Back to Dashboard
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
