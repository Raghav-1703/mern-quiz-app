import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, Compass, LayoutDashboard, Key, History, PlusCircle, ListTodo, LogOut, ShieldCheck, GraduationCap } from "lucide-react";

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
            <Sparkles size={20} />
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
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/join-quiz" className={isActive("/join-quiz")}>
                  <Key size={16} />
                  Join Quiz
                </Link>
                <Link to="/profile" className={isActive("/profile")}>
                  <History size={16} />
                  My History
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
                  <LayoutDashboard size={16} />
                  Admin Overview
                </Link>
                <Link to="/admin/create-quiz" className={isActive("/admin/create-quiz")}>
                  <PlusCircle size={16} />
                  Create Quiz
                </Link>
                <Link to="/admin/quizzes" className={isActive("/admin/quizzes")}>
                  <ListTodo size={16} />
                  Manage Quizzes
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/" className={isActive("/")}>
              <Compass size={16} />
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
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: isAdmin ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "#fff",
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
              {isAdmin ? "👑 Admin" : "🎓 Student"}
            </span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Log Out">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
