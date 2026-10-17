import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Trophy,
  ArrowLeft,
  Users,
  FileText
} from "lucide-react";
import { fetchQuizResults } from "../../services/resultService.js";
import { fetchQuizById } from "../../services/quizService.js";

export default function QuizResults() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchQuizResults(quizId), fetchQuizById(quizId)])
      .then(([resultsData, quizData]) => {
        setResults(resultsData || []);
        setQuiz(quizData);
      })
      .catch((err) => {
        console.error("Failed to load submissions:", err);
        setError("Unable to load submission records for this quiz.");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="container" style={{ marginTop: "24px" }}>
      {/* Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div className="hero-pill-badge" style={{ marginBottom: "8px" }}>
            <Sparkles size={13} />
            <span>Submission Records</span>
          </div>
          <h1 style={{ fontSize: "28px", color: "var(--text)", marginBottom: "4px" }}>
            {quiz?.title || "Quiz Submissions"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Review candidate scores, accuracy, and detailed response breakdowns.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/leaderboard/${quizId}`} className="btn-primary">
            <Trophy size={16} />
            View Leaderboard
          </Link>
          <Link to="/admin/quizzes" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to Quizzes
          </Link>
        </div>
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading participant submissions…</p>
        </div>
      )}

      {error && <div className="alert-box alert-error" style={{ marginBottom: "16px" }}>{error}</div>}

      {!loading && results.length === 0 && (
        <div className="card-modern" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Users size={36} color="var(--primary)" style={{ opacity: 0.4, marginBottom: "12px" }} />
          <h3 style={{ fontSize: "17px", color: "var(--text)", marginBottom: "6px" }}>
            No Submissions Yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Share the quiz with students to start collecting candidate assessments.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="card-modern" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "17px", color: "var(--text)" }}>
              Total Submissions: {results.length}
            </h3>
            {quiz?.quizCode && (
              <span className="code-pill">Code: {quiz.quizCode}</span>
            )}
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Correct / Total</th>
                  <th>Time Taken</th>
                  <th>Submitted At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ color: "var(--text)" }}>
                        {r.user?.name || "Candidate"}
                      </strong>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{r.user?.email || "—"}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{r.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}> / {r.totalMarks}</span>
                    </td>
                    <td>
                      <span
                        className="badge-tag"
                        style={{
                          background:
                            r.percentage >= 80
                              ? "rgba(63, 125, 88, 0.12)"
                              : r.percentage >= 50
                              ? "rgba(183, 121, 31, 0.12)"
                              : "rgba(178, 58, 58, 0.12)",
                          color:
                            r.percentage >= 80
                              ? "var(--easy)"
                              : r.percentage >= 50
                              ? "var(--medium)"
                              : "var(--hard)",
                        }}
                      >
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ color: "var(--text)", fontSize: "13px" }}>
                      {r.correctAnswers} / {r.totalQuestions}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {formatTime(r.timeTaken)}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {new Date(r.submittedAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/result/${r._id}`}
                        className="btn-secondary-sm"
                      >
                        <FileText size={12} /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
