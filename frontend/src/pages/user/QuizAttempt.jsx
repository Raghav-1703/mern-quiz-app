import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuizAttempt, submitQuizAnswers } from "../../services/quizService.js";
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Send, Sparkles, HelpCircle } from "lucide-react";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> optionIndex
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error | submitted
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const hasAutoSubmittedRef = useRef(false);
  const selectedAnswersRef = useRef({});

  // Keep ref synchronized with state for interval callback
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Load Quiz Attempt
  useEffect(() => {
    let isMounted = true;

    fetchQuizAttempt(id)
      .then((data) => {
        if (!isMounted) return;
        setQuiz(data);
        const durationSec = data.duration * 60;
        setTotalSeconds(durationSec);

        // Server-calculated remaining time
        const remaining = typeof data.remainingSeconds === "number" ? data.remainingSeconds : durationSec;
        setSecondsLeft(remaining);
        setStatus("ready");

        if (remaining <= 0) {
          handleFinalSubmit(true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Quiz attempt load error:", err);
        const msg = err.response?.data?.message || "Failed to load quiz.";
        setErrorMessage(msg);
        setStatus("error");
        if (err.response?.data?.alreadySubmitted && err.response?.data?.resultId) {
          navigate(`/result/${err.response.data.resultId}`, { replace: true });
        }
      });

    return () => {
      isMounted = false;
      clearInterval(timerRef.current);
    };
  }, [id, navigate]);

  // Submit Handler
  const handleFinalSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (hasAutoSubmittedRef.current || submitting) return;
      hasAutoSubmittedRef.current = true;
      setSubmitting(true);
      clearInterval(timerRef.current);

      try {
        const answersPayload = (quiz?.questions || []).map((q) => ({
          questionId: q._id,
          selectedAnswer:
            selectedAnswersRef.current[q._id] !== undefined
              ? selectedAnswersRef.current[q._id]
              : null,
        }));

        const response = await submitQuizAnswers(id, {
          answers: answersPayload,
        });

        const resultId = response.result?._id || response.resultId;
        navigate(`/result/${resultId}`, { replace: true });
      } catch (err) {
        console.error("Submission failed:", err);
        if (err.response?.data?.resultId) {
          navigate(`/result/${err.response.data.resultId}`, { replace: true });
        } else {
          setErrorMessage(err.response?.data?.message || "Failed to submit answers.");
          setSubmitting(false);
          hasAutoSubmittedRef.current = false;
        }
      }
    },
    [id, quiz, navigate, submitting]
  );

  // Real-time Countdown Timer (decreases every 1 second)
  useEffect(() => {
    if (status !== "ready" || secondsLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [status, handleFinalSubmit]);

  const handleSelectOption = (optionIndex) => {
    if (submitting || secondsLeft <= 0) return;
    const currentQ = quiz.questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ._id]: optionIndex,
    }));
  };

  const handleClearSelection = () => {
    if (submitting || secondsLeft <= 0) return;
    const currentQ = quiz.questions[currentIndex];
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ._id];
      return copy;
    });
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (status === "loading") {
    return (
      <div className="state-msg-container">
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: 500 }}>
          Preparing your secure quiz environment…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="alert-box alert-error" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "18px", color: "#9f1239" }}>Unable to Start Quiz</h3>
          <p>{errorMessage}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary" style={{ width: "fit-content", marginTop: "12px" }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const currentSelection = selectedAnswers[currentQuestion._id];
  const isTimeCritical = secondsLeft <= 60;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="container" style={{ maxWidth: "860px" }}>
      {/* Quiz Top Bar */}
      <div className="quiz-stage-header-clean">
        <div>
          <span className="code-pill font-mono" style={{ fontSize: "12px", marginBottom: "6px", display: "inline-block" }}>
            CODE: {quiz.quizCode}
          </span>
          <h2 style={{ fontSize: "22px", color: "var(--text-heading)" }}>{quiz.title}</h2>
        </div>

        {/* Real-time Timer Display */}
        <div className={`timer-badge-clean ${isTimeCritical ? "timer-critical-clean" : ""}`}>
          <Clock size={20} color={isTimeCritical ? "var(--coral)" : "var(--primary)"} />
          <div>
            <div className="timer-text-clean">{formatTimer(secondsLeft)}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isTimeCritical ? "var(--coral)" : "var(--text-muted)", letterSpacing: "0.05em" }}>
              {isTimeCritical ? "Ending Soon!" : "Time Remaining"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Question Palette */}
      <div className="palette-clean">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "13px", fontWeight: 600 }}>
          <span style={{ color: "var(--text-heading)" }}>Question {currentIndex + 1} of {totalQuestions}</span>
          <span style={{ color: "var(--primary)", background: "var(--primary-light)", padding: "3px 10px", borderRadius: "var(--radius-full)" }}>
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q._id] !== undefined;
            const isCurrent = idx === currentIndex;
            let pillClass = "q-pill-clean";
            if (isCurrent) pillClass += " q-pill-current";
            else if (isAnswered) pillClass += " q-pill-answered";

            return (
              <button
                key={q._id}
                type="button"
                className={pillClass}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card-clean">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Question {currentIndex + 1}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, background: "var(--surface-raised)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "var(--radius-full)", color: "var(--text-muted)" }}>
            +{currentQuestion.marks || 1} mark
          </span>
        </div>

        <h3 className="question-text-clean">{currentQuestion.question}</h3>

        {/* Options List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = currentSelection === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                className={`option-btn-clean ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectOption(optIdx)}
                disabled={submitting || secondsLeft <= 0}
              >
                <span className="option-letter-clean">{OPTION_LABELS[optIdx]}</span>
                <span style={{ fontSize: "15px", fontWeight: 500, flex: 1 }}>{option}</span>
              </button>
            );
          })}
        </div>

        {currentSelection !== undefined && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              type="button"
              className="btn-link"
              style={{ color: "var(--text-muted)" }}
              onClick={handleClearSelection}
            >
              Clear Choice
            </button>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={submitting}
            >
              Next Question
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-submit"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
            >
              <Send size={16} />
              {submitting ? "Submitting Answers…" : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: "20px", color: "var(--text-heading)", marginBottom: "8px" }}>
              Ready to Submit Your Quiz?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-body)", marginBottom: "14px" }}>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{totalQuestions}</strong> questions.
            </p>

            {answeredCount < totalQuestions && (
              <div className="alert-box alert-warning" style={{ marginBottom: "20px" }}>
                <AlertTriangle size={16} />
                <span>You still have {totalQuestions - answeredCount} unanswered questions!</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Continue Quiz
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmit(false);
                }}
                disabled={submitting}
              >
                {submitting ? "Grading…" : "Yes, Submit Now →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
