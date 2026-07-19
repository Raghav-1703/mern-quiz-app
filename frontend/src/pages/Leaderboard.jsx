import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLeaderboard, fetchQuiz } from "../api/api.js";

export default function Leaderboard() {
  const { id } = useParams();
  const [scores, setScores] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([fetchLeaderboard(id), fetchQuiz(id)])
      .then(([scoreData, quizData]) => {
        setScores(scoreData);
        setQuizTitle(quizData.title);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  return (
    <div className="container">
      <div className="eyebrow">Leaderboard</div>
      <h1 className="hero-title">{quizTitle || "Top scores"}</h1>
      <p className="hero-sub">The ten best runs on this quiz, ranked by score.</p>

      {status === "loading" && <p className="state-msg">Loading leaderboard…</p>}
      {status === "error" && <p className="state-msg">Couldn't load the leaderboard.</p>}
      {status === "ready" && scores.length === 0 && (
        <p className="state-msg">No scores yet — be the first to play!</p>
      )}

      {status === "ready" && scores.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s._id}>
                <td className="rank-cell">#{i + 1}</td>
                <td>{s.playerName}</td>
                <td>{s.score}</td>
                <td>
                  {s.correctAnswers}/{s.totalQuestions}
                </td>
                <td>{s.timeTakenSeconds}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="actions-row">
        <Link className="btn-secondary" to="/">
          Back to all quizzes
        </Link>
      </div>
    </div>
  );
}
