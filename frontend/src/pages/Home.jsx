import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuizzes, joinQuizByCode } from "../services/quizService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Key, Clock, HelpCircle, Trophy, Zap, Shield, Search } from "lucide-react";

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [quizCodeInput, setQuizCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes()
      .then((data) => {
        setQuizzes(data || []);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Fetch quizzes failed:", err);
        setStatus("error");
      });
  }, []);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!quizCodeInput.trim()) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/join-quiz&code=${quizCodeInput.trim().toUpperCase()}`);
      return;
    }

    setJoining(true);
    setJoinError("");
    try {
      const data = await joinQuizByCode(quizCodeInput.trim());
      if (data.alreadySubmitted) {
        navigate(`/result/${data.resultId}`);
      } else {
        navigate(`/quiz/${data.quizId}`);
      }
    } catch (err) {
      setJoinError(
        err.response?.data?.message || "Invalid quiz code. Please double-check and retry."
      );
    } finally {
      setJoining(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean)))];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="explore-hero">
        <div className="hero-pill-badge">
          <Sparkles size={13} />
          <span>Interactive Testing & Quiz Platform</span>
        </div>

        <h1 className="explore-title">
          Sharpen Your Skills With{" "}
          <span className="headline-highlight">Timed Knowledge Tests</span>
        </h1>

        <p className="explore-sub">
          Join private assessments with an instructor code or choose from our curated question banks.
          Beat the clock, submit securely, and track your ranking!
        </p>

        {/* Hero Quick Join with Code Card */}
        <div className="hero-code-box">
          <div className="code-box-header">
            <Key size={16} color="var(--primary)" />
            <span>Have an Access Code? Enter it below:</span>
          </div>

          <form className="join-code-form-clean" onSubmit={handleJoinByCode}>
            <input
              type="text"
              className="code-input-clean"
              placeholder="e.g. MERN4821"
              value={quizCodeInput}
              onChange={(e) => {
                setQuizCodeInput(e.target.value.toUpperCase());
                setJoinError("");
              }}
              maxLength={12}
            />
            <button type="submit" className="btn-primary" disabled={joining}>
              {joining ? "Validating…" : "Join Quiz"}
            </button>
          </form>

          {joinError && (
            <div className="alert-box alert-error" style={{ marginTop: "12px", textAlign: "left" }}>
              <span>{joinError}</span>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Zap size={20} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "15px", color: "var(--text)" }}>Server-Side Grading</h4>
            <span className="stat-label-text">Zero answers leaked to browser beforehand</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Clock size={20} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "15px", color: "var(--text)" }}>Real-Time Timers</h4>
            <span className="stat-label-text">Anti-cheat server countdown & auto-submit</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper stat-icon-trophy">
            <Trophy size={20} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "15px", color: "var(--text)" }}>Live Leaderboards</h4>
            <span className="stat-label-text">Score & completion-time tiebreaker rankings</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <Shield size={20} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "15px", color: "var(--text)" }}>Access Controls</h4>
            <span className="stat-label-text">Secure private codes for private quizzes</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "22px", color: "var(--text)" }}>Available Public Quizzes</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Explore currently open assessments</p>
        </div>

        <div style={{ width: "100%", maxWidth: "300px" }}>
          <div className="input-with-icon">
            <Search className="input-icon-left" size={15} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-box"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 1 && (
        <div className="filter-tabs-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-tab-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {status === "loading" && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading quizzes…</p>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="alert-box alert-error" style={{ marginBottom: "24px" }}>
          <span>Couldn't connect to server. Ensure the backend API is running on port 5000.</span>
        </div>
      )}

      {/* Clean Empty State */}
      {status === "ready" && filteredQuizzes.length === 0 && (
        <div className="card-modern" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>No quizzes available yet</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
            {searchTerm ? "Try modifying your search filter." : "There are currently no public active quizzes. Administrators can author new quizzes."}
          </p>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="quiz-grid-clean">
        {filteredQuizzes.map((quiz) => (
          <div className="quiz-card-clean" key={quiz._id}>
            <div className="quiz-card-tag-row">
              <span className="badge-tag tag-cat">{quiz.category || "General"}</span>
              <span className={`badge-tag tag-${quiz.difficulty || "medium"}`}>
                {quiz.difficulty || "medium"}
              </span>
            </div>

            <h3 className="quiz-title-clean">{quiz.title}</h3>
            <p className="quiz-desc-clean">{quiz.description || "Test your understanding with timed questions."}</p>

            <div className="quiz-meta-row">
              <span className="meta-item">
                <Clock size={13} color="var(--primary)" />
                {quiz.duration} min duration
              </span>
              <span className="meta-item">
                <HelpCircle size={13} color="var(--primary)" />
                {quiz.questionCount} questions
              </span>
            </div>

            <div className="quiz-card-actions">
              <Link to={`/quiz/${quiz._id}`} className="btn-primary" style={{ flex: 1, padding: "8px 14px", fontSize: "13px" }}>
                Start Quiz
              </Link>
              <Link to={`/leaderboard/${quiz._id}`} className="btn-secondary" style={{ padding: "8px 12px" }} title="View Leaderboard">
                <Trophy size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
