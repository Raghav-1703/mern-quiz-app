import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import UserDashboard from "../pages/user/UserDashboard.jsx";
import JoinQuiz from "../pages/user/JoinQuiz.jsx";
import QuizAttempt from "../pages/user/QuizAttempt.jsx";
import QuizResultPage from "../pages/user/QuizResultPage.jsx";
import QuizLeaderboard from "../pages/user/QuizLeaderboard.jsx";
import Profile from "../pages/user/Profile.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import CreateQuiz from "../pages/admin/CreateQuiz.jsx";
import AdminQuizzes from "../pages/admin/AdminQuizzes.jsx";
import QuizResults from "../pages/admin/QuizResults.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminRoute from "../components/AdminRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/join-quiz"
        element={
          <ProtectedRoute>
            <JoinQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizAttempt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:id"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:quizId"
        element={
          <ProtectedRoute>
            <QuizLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/create-quiz"
        element={
          <AdminRoute>
            <CreateQuiz />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/quizzes"
        element={
          <AdminRoute>
            <AdminQuizzes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/quizzes/:id"
        element={
          <AdminRoute>
            <AdminQuizzes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <AdminRoute>
            <AdminQuizzes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/results/:quizId"
        element={
          <AdminRoute>
            <QuizResults />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/leaderboard/:quizId"
        element={
          <AdminRoute>
            <QuizLeaderboard />
          </AdminRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
