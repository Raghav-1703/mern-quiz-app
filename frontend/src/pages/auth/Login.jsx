import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, Zap, Shield, Trophy, ArrowRight, UserCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get("expired") === "true";

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = isAdmin ? "/admin/dashboard" : "/dashboard";
      navigate(location.state?.from?.pathname || redirectPath, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both your email and password.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const target = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      navigate(location.state?.from?.pathname || target, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="container">
      <div className="auth-split-wrapper">
        {/* Left Side: Educational Illustration & Value Props */}
        <div className="auth-hero-showcase">
          <div className="auth-hero-badge">
            <Sparkles size={14} />
            <span>Smarter Learning Starts Here</span>
          </div>

          <h1 className="auth-hero-title">
            Master Any Subject Through <span className="gradient-text">Interactive Quizzes</span>
          </h1>

          <p className="auth-hero-desc">
            Challenge yourself with real-time countdown tests, join instructor classes with unique access codes, and analyze your performance with instant server-graded feedback.
          </p>

          {/* Educational Visual Area with Floating Quiz Cards */}
          <div className="auth-illustration-container">
            <div className="auth-illustration-bg-blob" />

            <div className="auth-interactive-preview">
              <div className="floating-quiz-card" style={{ transform: "rotate(-1deg)" }}>
                <div className="floating-card-left">
                  <div className="floating-card-icon icon-purple">⚛️</div>
                  <div className="floating-card-meta">
                    <h4>MERN Stack Fundamentals</h4>
                    <p>5 Questions · High Accuracy</p>
                  </div>
                </div>
                <span className="floating-card-badge badge-green">95% Score</span>
              </div>

              <div className="floating-quiz-card" style={{ transform: "rotate(1.5deg)", marginLeft: "24px" }}>
                <div className="floating-card-left">
                  <div className="floating-card-icon icon-amber">🔥</div>
                  <div className="floating-card-meta">
                    <h4>Daily Learning Streak</h4>
                    <p>7 Days Active</p>
                  </div>
                </div>
                <span className="floating-card-badge badge-purple">On Fire!</span>
              </div>

              <div className="floating-quiz-card" style={{ transform: "rotate(-0.5deg)" }}>
                <div className="floating-card-left">
                  <div className="floating-card-icon icon-green">⏳</div>
                  <div className="floating-card-meta">
                    <h4>Timed Real-Time Exam</h4>
                    <p>10m Countdown · Anti-Cheat</p>
                  </div>
                </div>
                <span className="floating-card-badge badge-green">08:42 Left</span>
              </div>
            </div>
          </div>

          {/* Three Feature Highlights */}
          <div className="auth-features-row">
            <div className="auth-feature-item">
              <div className="feature-check-icon">
                <Zap size={13} />
              </div>
              <span>Instant Grading</span>
            </div>

            <div className="auth-feature-item">
              <div className="feature-check-icon">
                <Shield size={13} />
              </div>
              <span>Zero-Knowledge Quiz</span>
            </div>

            <div className="auth-feature-item">
              <div className="feature-check-icon">
                <Trophy size={13} />
              </div>
              <span>Global Rankings</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Rounded White Login Card */}
        <div className="auth-card-clean">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access your dashboard.</p>
          </div>

          {isExpired && (
            <div className="alert-box alert-warning">
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="demo-logins-section">
            <div className="demo-logins-title">
              <UserCheck size={14} />
              <span>Quick Demo Accounts</span>
            </div>

            <div className="demo-cards-grid">
              <button
                type="button"
                className="demo-login-card"
                onClick={() => fillCredentials("admin@quizapp.com", "Admin@12345")}
              >
                <div className="demo-card-head">
                  <span className="demo-card-title">Educator / Admin</span>
                  <span className="demo-card-pill pill-admin">👑 Admin</span>
                </div>
                <span className="demo-card-email">admin@quizapp.com</span>
                <span className="demo-card-click">Click to Fill →</span>
              </button>

              <button
                type="button"
                className="demo-login-card"
                onClick={() => fillCredentials("rahul@quizapp.com", "User@12345")}
              >
                <div className="demo-card-head">
                  <span className="demo-card-title">Student Learner</span>
                  <span className="demo-card-pill pill-student">🎓 Student</span>
                </div>
                <span className="demo-card-email">rahul@quizapp.com</span>
                <span className="demo-card-click">Click to Fill →</span>
              </button>
            </div>
          </div>

          <p className="auth-footer-prompt">
            Don't have an account yet? <Link to="/signup">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
