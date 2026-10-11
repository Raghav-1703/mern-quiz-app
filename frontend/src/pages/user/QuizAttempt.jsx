import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuizAttempt, submitQuizAnswers } from "../../services/quizService.js";

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
        <p className="state-msg">Preparing your secure quiz environment…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container">
        <div className="alert-box alert-error">
          <h3>Unable to Start Quiz</h3>
          <p>{errorMessage}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary mt-4">
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
    <div className="container quiz-attempt-container">
      {/* Quiz Top Bar */}
      <div className="quiz-stage-header">
        <div className="quiz-info-meta">
          <span className="quiz-badge-code">CODE: {quiz.quizCode}</span>
          <h2 className="quiz-title-header">{quiz.title}</h2>
        </div>

        {/* Real-time Timer Display */}
        <div className={`timer-badge ${isTimeCritical ? "timer-critical" : ""}`}>
          <span className="timer-icon">⏳</span>
          <div className="timer-content">
            <span className="timer-text">{formatTimer(secondsLeft)}</span>
            <span className="timer-sublabel">
              {isTimeCritical ? "Submitting soon!" : "Remaining"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Question Palette */}
      <div className="palette-container">
        <div className="palette-label">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="answered-status">
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>
        <div className="question-pills-row">
          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q._id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q._id}
                type="button"
                className={`q-pill ${isCurrent ? "pill-current" : ""} ${
                  isAnswered ? "pill-answered" : ""
                }`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-header">
          <span className="q-label">Question {currentIndex + 1}</span>
          <span className="q-marks">+{currentQuestion.marks || 1} mark</span>
        </div>

        <h3 className="question-text">{currentQuestion.question}</h3>

        {/* Options List */}
        <div className="options-grid">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = currentSelection === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                className={`option-btn ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectOption(optIdx)}
                disabled={submitting || secondsLeft <= 0}
              >
                <span className="option-letter">{OPTION_LABELS[optIdx]}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {currentSelection !== undefined && (
          <div className="option-action-row">
            <button
              type="button"
              className="btn-link text-dim"
              onClick={handleClearSelection}
            >
              Clear Choice
            </button>
          </div>
        )}
      </div>

      {/* Navigation & Controls */}
      <div className="quiz-controls-row">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
        >
          ← Previous
        </button>

        <div className="right-controls">
          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={submitting}
            >
              Next Question →
            </button>
          ) : (
            <button
              type="button"
              className="btn-submit"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
            >
              {submitting ? "Submitting Answers…" : "Submit Quiz ✓"}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Ready to submit?</h3>
            <p>
              You have answered <strong>{answeredCount}</strong> out of{" "}
              <strong>{totalQuestions}</strong> questions.
            </p>
            {answeredCount < totalQuestions && (
              <p className="modal-warning">
                ⚠️ You have {totalQuestions - answeredCount} unanswered questions!
              </p>
            )}
            <div className="modal-actions">
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
                {submitting ? "Grading…" : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
