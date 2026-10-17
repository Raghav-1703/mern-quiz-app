import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, Zap, Shield, Trophy } from "lucide-react";

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

  return (
    <div className="container">
      <div className="auth-split-wrapper">
        {/* Left Side: Educational Motivation & Real Principles */}
        <div className="auth-hero-showcase">
          <div className="hero-pill-badge" style={{ width: "fit-content", marginBottom: "16px" }}>
            <Sparkles size={14} />
            <span>Smarter Learning Starts Here</span>
          </div>

          <h1 className="auth-hero-title">
            Master Any Subject Through Focused Knowledge Tests
          </h1>

          <p className="auth-hero-desc">
            Challenge your conceptual understanding with timed questions, join educator classes using unique access codes, and analyze performance with instant server-side grading.
          </p>

          <div className="card-modern" style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              Built for Academic & Professional Integrity:
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Zap size={14} />
                </div>
                <span><strong>Zero-Leakage Questions:</strong> Answer keys remain secured on MongoDB until submission.</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shield size={14} />
                </div>
                <span><strong>Server-Enforced Timers:</strong> Countdown behavior synchronized with real server time.</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trophy size={14} />
                </div>
                <span><strong>Tiebreaker Rankings:</strong> Scores and completion speeds decide official placement.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Clean White Login Card */}
        <div className="auth-card-clean">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access your dashboard.</p>
          </div>

          {isExpired && (
            <div className="alert-box alert-warning" style={{ marginBottom: "16px" }}>
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="alert-box alert-error" style={{ marginBottom: "16px" }}>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" size={17} />
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
                <Lock className="input-icon-left" size={17} />
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-footer-prompt">
            Don't have an account yet? <Link to="/signup">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
