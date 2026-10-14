import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuizzes, joinQuizByCode } from "../services/quizService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Key, Clock, HelpCircle, Trophy, ArrowRight, BookOpen, Brain, Zap, CheckCircle2, Shield, Search } from "lucide-react";

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [quizCodeInput, setQuizCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { isAuthenticated, isAdmin } = useAuth();
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
      q.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quizCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="explore-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} />
          <span>Interactive Testing & Quiz Platform</span>
        </div>

        <h1 className="explore-title">
          Sharpen Your Skills With <span className="gradient-text">Timed Knowledge Tests</span>
        </h1>

        <p className="explore-sub">
          Join tests with an instructor code or choose from our curated question banks.
          Beat the clock, submit securely, and conquer the leaderboard!
        </p>

        {/* Hero Quick Join with Code Card */}
        <div className="hero-code-box">
          <div className="code-box-header">
            <Key size={18} color="var(--primary)" />
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
              {joining ? "Validating…" : "Join Quiz →"}
            </button>
          </form>

          {joinError && (
            <div className="alert-box alert-error" style={{ marginTop: "14px", textAlign: "left" }}>
              <span>{joinError}</span>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "48px" }}>
        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#ede9fe", color: "var(--primary)" }}>
            <Zap size={24} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "16px", color: "var(--text-heading)" }}>Server-Side Grading</h4>
            <span className="stat-label-text">Zero answers sent to browser beforehand</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#dcfce7", color: "#16a34a" }}>
            <Clock size={24} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "16px", color: "var(--text-heading)" }}>Real-Time Timers</h4>
            <span className="stat-label-text">Anti-cheat server countdown & auto-submit</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>
            <Trophy size={24} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "16px", color: "var(--text-heading)" }}>Live Leaderboards</h4>
            <span className="stat-label-text">Score & completion-time tiebreaker rankings</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <Brain size={24} />
          </div>
          <div className="stat-info-col">
            <h4 style={{ fontSize: "16px", color: "var(--text-heading)" }}>In-Depth Explanations</h4>
            <span className="stat-label-text">Full review breakdown for every question</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", color: "var(--text-heading)" }}>Available Quizzes</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Explore tests created by verified educators</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: "340px" }}>
          <div className="input-with-icon" style={{ width: "100%" }}>
            <Search className="input-icon-left" size={16} />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "38px", height: "42px", borderRadius: "var(--radius-full)" }}
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="filter-tabs-row" style={{ justifyContent: "flex-start" }}>
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
          <p style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: 500 }}>Loading quizzes…</p>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="alert-box alert-error" style={{ marginBottom: "28px" }}>
          <span>Couldn't connect to server. Ensure the backend API is running on port 5000.</span>
        </div>
      )}

      {/* Empty State */}
      {status === "ready" && filteredQuizzes.length === 0 && (
        <div className="card-modern" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
          <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>No quizzes found</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
            {searchTerm ? "Try modifying your search filter." : "No quizzes are available right now."}
          </p>
          {isAdmin && (
            <Link to="/admin/create-quiz" className="btn-primary">
              Create the First Quiz
            </Link>
          )}
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
                <Clock size={14} color="var(--primary)" />
                {quiz.duration} min duration
              </span>
              <span className="meta-item">
                <HelpCircle size={14} color="var(--primary)" />
                {quiz.questionCount} questions
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span className="quiz-code-badge">CODE: {quiz.quizCode}</span>
              {quiz.createdBy && (
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  By: {quiz.createdBy.name || "Educator"}
                </span>
              )}
            </div>

            <div className="quiz-card-actions">
              <Link to={`/quiz/${quiz._id}`} className="btn-primary" style={{ padding: "10px 16px", fontSize: "14px" }}>
                Start Quiz →
              </Link>
              <Link to={`/leaderboard/${quiz._id}`} className="btn-secondary" style={{ padding: "10px 14px" }} title="View Leaderboard">
                <Trophy size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
