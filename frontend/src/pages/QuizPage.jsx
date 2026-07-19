import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuiz, submitQuiz } from "../api/api.js";
import TimerRing from "../components/TimerRing.jsx";
import DotProgress from "../components/DotProgress.jsx";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    fetchQuiz(id)
      .then((data) => {
        setQuiz(data);
        setSecondsLeft(data.timePerQuestion);
        setStatus("ready");
        startTimeRef.current = Date.now();
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const currentQuestion = quiz?.questions[currentIndex];
  const isLastQuestion = quiz && currentIndex === quiz.questions.length - 1;

  // Countdown timer per question
  useEffect(() => {
    if (status !== "ready" || !quiz) return;
    clearInterval(tickRef.current);

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          handleLockAnswer(null, true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, status]);

  const handleSelect = (optionIndex) => {
    if (selected !== null) return;
    handleLockAnswer(optionIndex, false);
  };

  const handleLockAnswer = (optionIndex, timedOut) => {
    clearInterval(tickRef.current);
    setSelected(optionIndex === null ? -1 : optionIndex);

    const newAnswer = {
      questionId: currentQuestion._id,
      selectedIndex: optionIndex,
    };
    setAnswers((prev) => [...prev, newAnswer]);
  };

  const goToNext = () => {
    if (isLastQuestion) {
      finishQuiz();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setSecondsLeft(quiz.timePerQuestion);
  };

  const finishQuiz = async () => {
    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      navigate(`/result/${id}`, {
        state: { answers, timeTakenSeconds },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") return <p className="state-msg">Loading quiz…</p>;
  if (status === "error")
    return <p className="state-msg">Couldn't load this quiz. It may have been removed.</p>;

  return (
    <div className="container">
      <div className="stage">
        <div className="stage-header">
          <DotProgress total={quiz.questions.length} current={currentIndex} />
          <TimerRing secondsLeft={secondsLeft} totalSeconds={quiz.timePerQuestion} />
        </div>

        <div className="question-card">
          <div className="question-number">
            Question {currentIndex + 1} of {quiz.questions.length}
          </div>
          <h2 className="question-text">{currentQuestion.text}</h2>

          <div className="options">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${selected === i ? "selected" : ""}`}
                disabled={selected !== null}
                onClick={() => handleSelect(i)}
              >
                <span className="option-letter">{LETTERS[i]}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="stage-footer">
          <button className="next-btn" disabled={selected === null || submitting} onClick={goToNext}>
            {isLastQuestion ? (submitting ? "Submitting…" : "Finish quiz") : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}
