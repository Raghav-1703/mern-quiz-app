import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Trophy,
  ArrowLeft,
  Users,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
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
        setResults(resultsData);
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
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: "1080px" }}>
      {/* Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "32px"
        }}
      >
        <div>
          <div className="badge-modern" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <Sparkles size={14} /> Candidate Submissions
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "6px" }}>
            {quiz?.title || "Quiz Submissions"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Inspect candidate scores, time taken, and answer breakdowns for this assessment.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to={`/leaderboard/${quizId}`}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Trophy size={18} />
            View Leaderboard
          </Link>
          <Link
            to="/admin/quizzes"
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={18} />
            Back to Quizzes
          </Link>
        </div>
      </div>

      {loading && (
        <div className="state-msg-container">
          <div className="spinner" />
          <p className="state-msg">Loading participant submissions…</p>
        </div>
      )}

      {error && <div className="alert-box alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

      {!loading && results.length === 0 && (
        <div className="card-modern" style={{ padding: "64px 32px", textAlign: "center" }}>
          <Users size={48} color="var(--primary)" style={{ opacity: 0.35, marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", color: "var(--text-heading)", marginBottom: "8px" }}>
            No Candidates Have Submitted Yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Distribute the quiz access code <span className="code-pill">{quiz?.quizCode}</span> to your students to start collecting assessments.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="card-modern">
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>
              Total Submissions: {results.length}
            </h3>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
              Code: <span className="code-pill">{quiz?.quizCode}</span>
            </span>
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
                  <th>Duration</th>
                  <th>Submitted At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ color: "var(--text-heading)", fontSize: "14px" }}>
                        {r.user?.name || "Candidate"}
                      </strong>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{r.user?.email || "—"}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>{r.score}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}> / {r.totalMarks}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          r.percentage >= 80
                            ? "status-success"
                            : r.percentage >= 50
                            ? "status-warning"
                            : "status-danger"
                        }`}
                      >
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ color: "var(--text-main)", fontSize: "13px" }}>
                      {r.correctAnswers} / {r.totalQuestions}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      ⏱️ {formatTime(r.timeTaken)}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {new Date(r.submittedAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/result/${r._id}`}
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
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
