import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { joinQuizByCode, fetchEnrolledQuizzes } from "../../services/quizService.js";
import { fetchMyResults } from "../../services/resultService.js";
import { Sparkles, Key, CheckCircle, Award, Target, Clock, ArrowRight, ShieldCheck, Trophy, Eye } from "lucide-react";

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
    <div className="container">
      {/* Welcome & Role Upgrade Banner */}
      <div className="card-modern" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "28px", background: "linear-gradient(135deg, #ffffff 0%, #fbf9f6 100%)" }}>
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
            <Sparkles size={13} />
            <span>Student Dashboard</span>
          </div>
          <h1 style={{ fontSize: "28px", color: "var(--text-heading)", marginBottom: "4px" }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
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
          <ShieldCheck size={16} color="var(--primary)" />
          {upgrading ? "Upgrading…" : "👑 Upgrade to Educator / Admin"}
        </button>
      </div>

      {/* Join Quiz Code Box */}
      <div className="card-modern" style={{ marginBottom: "32px", border: "1.5px solid var(--border-purple)", background: "linear-gradient(135deg, #fdfcff 0%, #f7f4ff 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Key size={18} color="var(--primary)" />
          <h3 style={{ fontSize: "18px", color: "var(--text-heading)" }}>Enter Quiz Code</h3>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Have a quiz access code from your instructor or peer? Enter it below to unlock the test.
        </p>

        <form className="join-code-form-clean" onSubmit={handleJoinCode} style={{ maxWidth: "480px" }}>
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
            {joining ? "Checking…" : "Join Quiz →"}
          </button>
        </form>
        {joinError && (
          <div className="alert-box alert-error" style={{ marginTop: "12px", maxWidth: "480px" }}>
            <span>{joinError}</span>
          </div>
        )}
      </div>

      {/* Performance Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#ede9fe", color: "var(--primary)" }}>
            <Award size={24} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{totalQuizzes}</span>
            <span className="stat-label-text">Quizzes Completed</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#dcfce7", color: "#16a34a" }}>
            <Target size={24} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{avgScore}%</span>
            <span className="stat-label-text">Average Accuracy</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Trophy size={24} />
          </div>
          <div className="stat-info-col">
            <span className="stat-value">{bestScore}%</span>
            <span className="stat-label-text">Highest Score</span>
          </div>
        </div>
      </div>

      {/* Associated Quizzes via Admin Code */}
      {enrolledQuizzes.length > 0 && (
        <div className="card-modern" style={{ marginBottom: "32px" }}>
          <div className="card-header-modern">
            <div>
              <h3>Associated Quizzes (Joined via Admin Code)</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
                Tests you have successfully unlocked with valid educator codes.
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
                      <span style={{ fontWeight: 600 }}>{eq.admin?.name || "Admin"}</span>
                      {eq.admin?.email && (
                        <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)" }}>
                          {eq.admin.email}
                        </span>
                      )}
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

      {/* Recent Results */}
      <div className="card-modern">
        <div className="card-header-modern">
          <h3>Your Recent Quiz Results</h3>
          <Link to="/" className="btn-link">
            Browse All Quizzes →
          </Link>
        </div>

        {loading ? (
          <div className="state-msg-container">
            <div className="spinner" />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading your test history…</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "15px" }}>
              You haven't completed any quizzes yet.
            </p>
            <Link to="/" className="btn-primary">
              Take Your First Quiz →
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
                    <td style={{ fontWeight: 700 }}>{r.quiz?.title || "Quiz"}</td>
                    <td>
                      <span className="code-pill font-mono">{r.quiz?.quizCode || "—"}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
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
                    <td style={{ color: "var(--text-muted)" }}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link to={`/result/${r._id}`} className="btn-secondary-sm">
                          <Eye size={13} />
                          Review
                        </Link>
                        {r.quiz?._id && (
                          <Link to={`/leaderboard/${r.quiz._id}`} className="btn-secondary-sm" title="View Leaderboard">
                            <Trophy size={13} />
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
