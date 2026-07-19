import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          Quizzical
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/quiz/:id/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}
