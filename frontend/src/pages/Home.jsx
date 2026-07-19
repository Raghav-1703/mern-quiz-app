import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchQuizzes } from "../api/api.js";

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    fetchQuizzes()
      .then((data) => {
        setQuizzes(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="container">
      <div className="eyebrow">Trivia Night</div>
      <h1 className="hero-title">Step into the spotlight.</h1>
      <p className="hero-sub">
        Pick a category, beat the clock, and see how you stack up on the leaderboard.
      </p>

      {status === "loading" && <p className="state-msg">Loading quizzes…</p>}
      {status === "error" && (
        <p className="state-msg">
          Couldn't reach the server. Make sure the backend is running and seeded.
        </p>
      )}
      {status === "ready" && quizzes.length === 0 && (
        <p className="state-msg">
          No quizzes yet — run <code>npm run seed</code> in the backend folder.
        </p>
      )}

      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <Link to={`/quiz/${quiz._id}`} className="quiz-card" key={quiz._id}>
            <div className="tag-row">
              <span className="tag">{quiz.category}</span>
              <span className={`tag difficulty-${quiz.difficulty}`}>{quiz.difficulty}</span>
            </div>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <div className="quiz-meta">
              {quiz.questionCount} questions · {quiz.timePerQuestion}s each
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
