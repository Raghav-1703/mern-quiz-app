import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { joinQuizByCode, fetchEnrolledQuizzes } from "../../services/quizService.js";
import { fetchMyResults } from "../../services/resultService.js";
import { Sparkles, Key, Award, Target, Trophy, Eye, Clock } from "lucide-react";

export default function UserDashboard() {
  const { user, becomeAdmin } = useAuth();
  const [quizCode, setQuizCode] = useState("");
  const [results, setResults] = useState([]);
  const [enrolledQuizzes, setEnrolledQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchMyResults(), fetchEnrolledQuizzes()])
      .then(([resultsData, enrolledData]) => {
        setResults(resultsData || []);
        setEnrolledQuizzes(enrolledData || []);
      })
      .catch((err) => console.error("Failed to fetch user dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinCode = async (e) => {
    e.preventDefault();
    if (!quizCode.trim()) return;

    setJoining(true);
    setJoinError("");
    try {
      const data = await joinQuizByCode(quizCode.trim());
      if (data.alreadySubmitted) {
        navigate(`/result/${data.resultId}`);
      } else {
        navigate(`/quiz/${data.quizId}`);
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || "Invalid quiz code.");
    } finally {
      setJoining(false);
    }
  };

  const totalQuizzes = results.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalQuizzes)
      : 0;
  const bestScore =
    totalQuizzes > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div className="card-modern" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
            <Sparkles size={13} />
            <span>Student Dashboard</span>
          </div>
          <h1 style={{ fontSize: "26px", color: "var(--text)", marginBottom: "4px" }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Track your progress, join private assessments using codes, and view your ranking.
          </p>
        </div>

        {user?.role !== "admin" && (
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              if (window.confirm("Upgrade your account to Administrator? You will be able to author quizzes and generate private access codes.")) {
                setUpgrading(true);
                try {
                  await becomeAdmin();
                  navigate("/admin/dashboard");
                } catch (err) {
                  alert("Failed to upgrade.");
                } finally {
                  setUpgrading(false);
                }
              }
            }}
            disabled={upgrading}
          >
            {upgrading ? "Upgrading…" : "Upgrade to Admin"}
          </button>
        )}
      </div>

      {/* Join Quiz Code Box */}
      <div className="card-modern" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Key size={16} color="var(--primary)" />
          <h3 style={{ fontSize: "17px", color: "var(--text)" }}>Join With Access Code</h3>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
          Have an access code from your instructor? Enter it below to unlock the private assessment.
        </p>

        <form className="join-code-form-clean" onSubmit={handleJoinCode} style={{ maxWidth: "440px" }}>
          <input
            type="text"
            className="code-input-clean"
            placeholder="e.g. MERN4821"
            value={quizCode}
            onChange={(e) => {
              setQuizCode(e.target.value.toUpperCase());
              setJoinError("");
            }}
            maxLength={12}
          />
          <button type="submit" className="btn-primary" disabled={joining}>
            {joining ? "Checking…" : "Join Quiz"}
          </button>
        </form>
        {joinError && (
          <div className="alert-box alert-error" style={{ marginTop: "12px", maxWidth: "440px" }}>
            <span>{joinError}</span>
          </div>
        )}
      </div>

      {/* Performance Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Award size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{totalQuizzes}</span>
            <span className="stat-label-text">Quizzes Completed</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Target size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{avgScore}%</span>
            <span className="stat-label-text">Average Accuracy</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper stat-icon-trophy">
            <Trophy size={20} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{bestScore}%</span>
            <span className="stat-label-text">Highest Score</span>
          </div>
        </div>
      </div>

      {/* Enrolled Quizzes via Admin Code */}
      {enrolledQuizzes.length > 0 && (
        <div className="card-modern" style={{ marginBottom: "24px" }}>
          <div className="card-header-modern">
            <div>
              <h3>Private Quizzes (Joined via Code)</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                Tests you have unlocked with valid instructor codes.
              </p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Instructor</th>
                  <th>Code</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledQuizzes.map((eq) => (
                  <tr key={eq._id}>
                    <td><strong>{eq.title}</strong></td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {eq.admin?.name || "Instructor"}
                    </td>
                    <td><span className="code-pill">{eq.quizCode}</span></td>
                    <td>{eq.duration} min</td>
                    <td>
                      <span className={`status-pill status-${eq.status}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {eq.status === "active" ? (
                        <Link to={`/quiz/${eq._id}`} className="btn-primary-sm">
                          Start Quiz
                        </Link>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {eq.status === "scheduled" ? "Opens soon" : "Closed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="card-modern">
        <div className="card-header-modern">
          <h3>Your Quiz History</h3>
          <Link to="/" className="btn-link">
            Browse Public Quizzes →
          </Link>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading your test history…</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "14px" }}>
              No quiz attempts recorded yet.
            </p>
            <Link to="/" className="btn-primary">
              Take Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.quiz?.title || "Quiz"}</td>
                    <td>
                      {r.score} / {r.totalMarks}
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
                        <Link to={`/result/${r._id}`} className="btn-secondary-sm">
                          <Eye size={12} />
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link to={`/leaderboard/${r.quiz._id}`} className="btn-secondary-sm" title="View Leaderboard">
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
