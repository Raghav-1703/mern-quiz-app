import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="container auth-container">
      <div className="auth-card">
        <div className="eyebrow">Get Started</div>
        <h1 className="hero-title auth-title">Create your account</h1>
        <p className="hero-sub auth-sub">
          Join tests, challenge fellow learners, and view instant score analytics.
        </p>

        {error && <div className="alert-box alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>
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
                  <strong>🎓 Student Account</strong>
                  <p className="role-desc">Join quizzes using admin codes and view score analytics.</p>
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
                  <strong>👑 Admin / Educator Account</strong>
                  <p className="role-desc">Create quizzes, generate unique codes, and monitor participants.</p>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
