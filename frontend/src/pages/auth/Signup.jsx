import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user"); // "user" | "admin"
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      const user = await signup(payload);
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-split-wrapper">
        {/* Left Side: Educational Motivation & Role Details */}
        <div className="auth-hero-showcase">
          <div className="hero-pill-badge" style={{ width: "fit-content", marginBottom: "16px" }}>
            <Sparkles size={14} />
            <span>Join Quizzical Today</span>
          </div>

          <h1 className="auth-hero-title">
            Level Up Your Knowledge With Focused Assessments
          </h1>

          <p className="auth-hero-desc">
            Whether you are a student testing your skills under timed exam conditions or an educator authoring private class quizzes, Quizzical delivers the platform you need.
          </p>

          <div className="card-modern" style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              Account Capabilities:
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎯</span> <strong>Access by Code:</strong> Instantly join private educator quizzes.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⏱️</span> <strong>Real-Time Timers:</strong> Practice with anti-cheat server countdowns.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📊</span> <strong>Detailed Reviews:</strong> Understand every question rationale.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>👑</span> <strong>Educator Tools:</strong> Author public or private tests and inspect analytics.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Clean Rounded Registration Card */}
        <div className="auth-card-clean">
          <div className="auth-card-header">
            <h2>Create Your Account</h2>
            <p>Start learning or authoring quizzes in under a minute.</p>
          </div>

          {error && (
            <div className="alert-box alert-error" style={{ marginBottom: "16px" }}>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon-left" size={17} />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon-left" size={17} />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" size={17} />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            {/* Account Type Selection */}
            <div className="form-group">
              <label>Select Your Role</label>
              <div className="role-selector-grid">
                <label className={`role-card-opt ${role === "user" ? "role-card-selected" : ""}`}>
                  <input
                    type="radio"
                    name="signup-role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                  />
                  <div>
                    <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                      <GraduationCap size={16} color="var(--primary)" />
                      Student
                    </strong>
                    <p className="role-desc">Join tests via code, compete & track scores.</p>
                  </div>
                </label>

                <label className={`role-card-opt ${role === "admin" ? "role-card-selected" : ""}`}>
                  <input
                    type="radio"
                    name="signup-role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                  />
                  <div>
                    <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                      <ShieldCheck size={16} color="var(--primary)" />
                      Admin
                    </strong>
                    <p className="role-desc">Create quizzes, set access codes & view analytics.</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }} disabled={submitting}>
              {submitting ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-prompt">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
