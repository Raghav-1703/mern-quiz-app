import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Please fill in both email and password.");
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
    <div className="container auth-container">
      <div className="auth-card">
        <div className="eyebrow">Welcome Back</div>
        <h1 className="hero-title auth-title">Sign in to your account</h1>
        <p className="hero-sub auth-sub">
          Take quizzes, track scores, and compete on the leaderboard.
        </p>

        {isExpired && (
          <div className="alert-box alert-warning">
            Your session has expired. Please sign in again.
          </div>
        )}

        {error && <div className="alert-box alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">Quick Demo Logins</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo"
              onClick={() => fillCredentials("admin@quizapp.com", "Admin@12345")}
            >
              Fill Admin (admin@quizapp.com)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => fillCredentials("rahul@quizapp.com", "User@12345")}
            >
              Fill Student (rahul@quizapp.com)
            </button>
          </div>
        </div>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup">Create one now</Link>
        </p>
      </div>
    </div>
  );
}
