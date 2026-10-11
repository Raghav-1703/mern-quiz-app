import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("quiz_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("quiz_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("quiz_token");
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem("quiz_user", JSON.stringify(freshUser));
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem("quiz_token");
          localStorage.removeItem("quiz_user");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem("quiz_token", data.token);
    localStorage.setItem("quiz_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);
    localStorage.setItem("quiz_token", data.token);
    localStorage.setItem("quiz_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem("quiz_token");
      localStorage.removeItem("quiz_user");
      setToken(null);
      setUser(null);
    }
  };

  const becomeAdmin = async () => {
    const data = await authService.becomeAdmin();
    localStorage.setItem("quiz_token", data.token);
    localStorage.setItem("quiz_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const isAdmin = user?.role === "admin";
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
        becomeAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
