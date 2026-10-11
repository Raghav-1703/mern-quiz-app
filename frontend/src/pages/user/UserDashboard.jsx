import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { joinQuizByCode, fetchEnrolledQuizzes } from "../../services/quizService.js";
import { fetchMyResults } from "../../services/resultService.js";

export default function UserDashboard() {
  const { user, logout, becomeAdmin } = useAuth();
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
    <div className="container dashboard-container">
      {/* Welcome Banner */}
      <div className="dash-welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div className="eyebrow">Student Dashboard</div>
          <h1 className="hero-title">Welcome back, {user?.name}!</h1>
          <p className="hero-sub" style={{ marginBottom: 0 }}>
            Track your progress, join new tests using a code, and view your ranking.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            if (window.confirm("Upgrade your account to Administrator? You will be able to author quizzes and generate access codes.")) {
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
          {upgrading ? "Upgrading…" : "👑 Become an Admin / Educator"}
        </button>
      </div>

      {/* Join Quiz Code Box */}
      <div className="dash-card join-box-card">
        <h3>Enter Quiz Code</h3>
        <p className="subtext">
          Have a quiz code from your instructor or peer? Enter it below to start immediately.
        </p>
        <form className="join-code-form" onSubmit={handleJoinCode}>
          <input
            type="text"
            className="code-input"
            placeholder="e.g. MERN4821"
            value={quizCode}
            onChange={(e) => {
              setQuizCode(e.target.value.toUpperCase());
              setJoinError("");
            }}
            maxLength={12}
          />
          <button type="submit" className="btn-join" disabled={joining}>
            {joining ? "Checking…" : "Join Quiz"}
          </button>
        </form>
        {joinError && <div className="alert-box alert-error mt-2">{joinError}</div>}
      </div>

      {/* Associated Quizzes via Admin Code */}
      {enrolledQuizzes.length > 0 && (
        <div className="dash-card mt-6">
          <div className="dash-card-header">
            <div>
              <h3>Associated Quizzes (Joined via Admin Code)</h3>
              <p className="subtext" style={{ marginBottom: 0 }}>
                Quizzes you have unlocked with valid instructor codes.
              </p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Admin / Instructor</th>
                  <th>Code</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledQuizzes.map((eq) => (
                  <tr key={eq._id}>
                    <td><strong>{eq.title}</strong></td>
                    <td>
                      <span>{eq.admin?.name || "Admin"}</span>
                      {eq.admin?.email && <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)" }}>{eq.admin.email}</span>}
                    </td>
                    <td><span className="code-pill font-mono">{eq.quizCode}</span></td>
                    <td>{eq.duration} min</td>
                    <td>{eq.questionCount}</td>
                    <td>
                      <Link to={`/quiz/${eq._id}`} className="btn-primary-sm">
                        Start Quiz →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{totalQuizzes}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgScore}%</div>
          <div className="stat-label">Average Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{bestScore}%</div>
          <div className="stat-label">Highest Score</div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="dash-card mt-6">
        <div className="dash-card-header">
          <h3>Your Recent Quiz Results</h3>
          <Link to="/" className="btn-link">
            Browse All Quizzes →
          </Link>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p className="state-msg">Loading your test history…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p className="state-msg">You haven't completed any quizzes yet.</p>
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
                  <th>Code</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Time Taken</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td className="font-bold">{r.quiz?.title || "Quiz"}</td>
                    <td>
                      <span className="code-pill">{r.quiz?.quizCode || "—"}</span>
                    </td>
                    <td>
                      {r.score} / {r.totalMarks}
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
                    <td>{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</td>
                    <td className="text-muted">
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="btn-group-sm">
                        <Link to={`/result/${r._id}`} className="btn-table-action">
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link
                            to={`/leaderboard/${r.quiz._id}`}
                            className="btn-table-action"
                          >
                            Leaderboard
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
