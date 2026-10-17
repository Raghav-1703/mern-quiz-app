import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Compass, LayoutDashboard, Key, History, PlusCircle, ListTodo, LogOut } from "lucide-react";

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
          <div className="brand-icon-wrapper">
            <Sparkles size={18} />
          </div>
          <span className="brand-title">Quizzical</span>
        </Link>
      </div>

      <nav className="topbar-nav">
        {isAuthenticated ? (
          <>
            {!isAdmin ? (
              <>
                <Link to="/dashboard" className={isActive("/dashboard")}>
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link to="/join-quiz" className={isActive("/join-quiz")}>
                  <Key size={15} />
                  Join Quiz
                </Link>
                <Link to="/profile" className={isActive("/profile")}>
                  <History size={15} />
                  My History
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
                  <LayoutDashboard size={15} />
                  Overview
                </Link>
                <Link to="/admin/create-quiz" className={isActive("/admin/create-quiz")}>
                  <PlusCircle size={15} />
                  Create Quiz
                </Link>
                <Link to="/admin/quizzes" className={isActive("/admin/quizzes")}>
                  <ListTodo size={15} />
                  Manage Quizzes
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/" className={isActive("/")}>
              <Compass size={15} />
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
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "var(--radius-sm)",
                background: isAdmin ? "var(--accent)" : "var(--primary-soft)",
                color: isAdmin ? "var(--text)" : "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="user-name">{user?.name}</span>
            <span className={`role-pill ${isAdmin ? "role-admin" : "role-user"}`}>
              {isAdmin ? "Admin" : "Student"}
            </span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log Out">
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
