import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuizAttempt, submitQuizAnswers } from "../../services/quizService.js";
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send, HelpCircle } from "lucide-react";

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
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Preparing your secure quiz environment…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container" style={{ maxWidth: "560px", marginTop: "40px" }}>
        <div className="alert-box alert-error" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "17px", color: "var(--hard)" }}>Unable to Start Quiz</h3>
          <p>{errorMessage}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary" style={{ width: "fit-content", marginTop: "10px" }}>
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
    <div className="container" style={{ maxWidth: "820px", marginTop: "16px" }}>
      {/* Quiz Top Bar */}
      <div className="quiz-stage-header-clean">
        <div>
          <h2 style={{ fontSize: "20px", color: "var(--text)" }}>{quiz.title}</h2>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {totalQuestions} questions &bull; {quiz.duration} min duration
          </span>
        </div>

        {/* Real-time Countdown Timer */}
        <div className={`timer-badge-clean ${isTimeCritical ? "timer-critical-clean" : ""}`}>
          <Clock size={18} color={isTimeCritical ? "var(--hard)" : "var(--primary)"} />
          <div>
            <div className="timer-text-clean">{formatTimer(secondsLeft)}</div>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: isTimeCritical ? "var(--hard)" : "var(--text-muted)" }}>
              {isTimeCritical ? "Ending Soon" : "Remaining"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Question Palette */}
      <div className="palette-clean">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", fontSize: "13px", fontWeight: 600 }}>
          <span style={{ color: "var(--text)" }}>Question {currentIndex + 1} of {totalQuestions}</span>
          <span style={{ color: "var(--primary)", background: "var(--primary-soft)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
            Question {currentIndex + 1}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
            +{currentQuestion.marks || 1} mark
          </span>
        </div>

        <h3 className="question-text-clean">{currentQuestion.question}</h3>

        {/* Options List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>{option}</span>
              </button>
            );
          })}
        </div>

        {currentSelection !== undefined && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <button
              type="button"
              className="btn-link"
              style={{ color: "var(--text-muted)", fontSize: "13px" }}
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
          <ChevronLeft size={15} />
          Previous
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={submitting}
            >
              Next
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
            >
              <Send size={15} />
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: "19px", color: "var(--text)", marginBottom: "8px" }}>
              Submit Your Quiz?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "14px" }}>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{totalQuestions}</strong> questions.
            </p>

            {answeredCount < totalQuestions && (
              <div className="alert-box alert-warning" style={{ marginBottom: "18px" }}>
                <AlertTriangle size={15} />
                <span>You have {totalQuestions - answeredCount} unanswered questions!</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
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
                {submitting ? "Grading…" : "Confirm Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
