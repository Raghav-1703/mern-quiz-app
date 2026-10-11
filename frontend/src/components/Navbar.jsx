import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "nav-link active" : "nav-link");

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <span className="brand-title">Quizzical</span>
        </Link>
      </div>

      <nav className="topbar-nav">
        {isAuthenticated ? (
          <>
            {!isAdmin ? (
              <>
                <Link to="/dashboard" className={isActive("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/join-quiz" className={isActive("/join-quiz")}>
                  Join Quiz
                </Link>
                <Link to="/profile" className={isActive("/profile")}>
                  My History
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
                  Admin Overview
                </Link>
                <Link to="/admin/create-quiz" className={isActive("/admin/create-quiz")}>
                  + Create Quiz
                </Link>
                <Link to="/admin/quizzes" className={isActive("/admin/quizzes")}>
                  Manage Quizzes
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/" className={isActive("/")}>
              Explore
            </Link>
            <Link to="/login" className={isActive("/login")}>
              Login
            </Link>
            <Link to="/signup" className="btn-primary-sm">
              Sign Up
            </Link>
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="topbar-user">
          <div className="user-badge">
            <span className="user-name">{user?.name}</span>
            <span className={`role-pill ${isAdmin ? "role-admin" : "role-user"}`}>
              {isAdmin ? "Admin" : "Student"}
            </span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log Out">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
