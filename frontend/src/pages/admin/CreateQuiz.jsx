import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createQuiz } from "../../services/quizService.js";

const DEFAULT_QUESTION = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  marks: 1,
  explanation: "",
});

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(10); // in minutes
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([DEFAULT_QUESTION(), DEFAULT_QUESTION()]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdQuiz, setCreatedQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  // Question editing handlers
  const handleQuestionTextChange = (qIndex, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].question = text;
      return copy;
    });
  };

  const handleOptionChange = (qIndex, optIndex, val) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].options[optIndex] = val;
      return copy;
    });
  };

  const handleCorrectAnswerChange = (qIndex, correctIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].correctAnswer = Number(correctIdx);
      return copy;
    });
  };

  const handleMarksChange = (qIndex, marks) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].marks = Math.max(1, Number(marks) || 1);
      return copy;
    });
  };

  const handleExplanationChange = (qIndex, exp) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].explanation = exp;
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, DEFAULT_QUESTION()]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) {
      setError("Quiz must contain at least 1 question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addOptionToQuestion = (qIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length < 6) {
        copy[qIndex].options.push("");
      }
      return copy;
    });
  };

  const removeOptionFromQuestion = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length <= 2) {
        setError("Each question must have at least 2 options.");
        return copy;
      }
      copy[qIndex].options.splice(optIndex, 1);
      if (copy[qIndex].correctAnswer >= copy[qIndex].options.length) {
        copy[qIndex].correctAnswer = 0;
      }
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a quiz title.");
      return;
    }

    if (duration < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    // Validate all questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${OPTION_LETTERS[j]} cannot be empty.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        category,
        difficulty,
        questions,
      };

      const res = await createQuiz(payload);
      setCreatedQuiz(res.quiz);
    } catch (err) {
      console.error("Create quiz failed:", err);
      setError(err.response?.data?.message || "Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (createdQuiz?.quizCode) {
      navigator.clipboard.writeText(createdQuiz.quizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdQuiz) {
    return (
      <div className="container success-container">
        <div className="auth-card text-center">
          <div className="success-icon">🎉</div>
          <div className="eyebrow">Creation Successful</div>
          <h1 className="hero-title">Quiz is Live!</h1>
          <p className="hero-sub">
            Your quiz <strong>{createdQuiz.title}</strong> has been saved. Students can now join
            using the code below.
          </p>

          <div className="created-code-box">
            <span className="code-label">OFFICIAL QUIZ CODE</span>
            <div className="code-display">{createdQuiz.quizCode}</div>
            <button type="button" className="btn-copy-lg" onClick={copyCode}>
              {copied ? "✓ Copied to Clipboard!" : "📋 Copy Code"}
            </button>
          </div>

          <div className="quiz-details-summary">
            <div>
              <span>Duration:</span> <strong>{createdQuiz.duration} Minutes</strong>
            </div>
            <div>
              <span>Questions:</span>{" "}
              <strong>{createdQuiz.questions?.length || questions.length}</strong>
            </div>
            <div>
              <span>Difficulty:</span> <strong className="capitalize">{createdQuiz.difficulty}</strong>
            </div>
          </div>

          <div className="created-actions-row">
            <Link to="/admin/dashboard" className="btn-primary">
              Return to Admin Dashboard
            </Link>
            <Link to={`/quiz/${createdQuiz._id}`} className="btn-secondary">
              Preview Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container create-quiz-container">
      <div className="create-quiz-header">
        <div className="eyebrow">Authoring Studio</div>
        <h1 className="hero-title">Create a New Quiz</h1>
        <p className="hero-sub">
          Build questions, define answers, and the system will generate a unique access code.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="quiz-form">
        {/* Basic Details Section */}
        <div className="form-card">
          <h2 className="form-card-title">1. General Information</h2>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label>Quiz Title *</label>
              <input
                type="text"
                placeholder="e.g. Full Stack MERN Fundamentals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group col-span-2">
              <label>Description</label>
              <textarea
                placeholder="What topics will this quiz assess?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Duration (Minutes) *</label>
              <input
                type="number"
                min="1"
                max="180"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
              <span className="form-hint">Server automatically manages the timer countdown.</span>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Database">Database</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="form-card mt-6">
          <div className="form-card-header">
            <div>
              <h2 className="form-card-title">2. Questions & Answers</h2>
              <p className="subtext">
                Select the radio button corresponding to the correct answer. Correct answers are
                securely stored in MongoDB and never leaked to candidates.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          <div className="questions-builder-list">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="builder-question-card">
                <div className="builder-q-header">
                  <span className="builder-q-number">Question #{qIndex + 1}</span>
                  <div className="builder-q-actions">
                    <label className="marks-label">
                      Marks:
                      <input
                        type="number"
                        min="1"
                        className="marks-input"
                        value={q.marks}
                        onChange={(e) => handleMarksChange(qIndex, e.target.value)}
                      />
                    </label>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-q"
                        onClick={() => removeQuestion(qIndex)}
                        title="Delete question"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="input-q-text"
                    placeholder="Enter question text (e.g. Which hook manages side effects?)"
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    required
                  />
                </div>

                <div className="builder-options-list">
                  <span className="options-legend">
                    Options (Select radio for correct answer):
                  </span>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="builder-option-row">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-answer-${qIndex}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                        />
                        <span className="opt-badge">{OPTION_LETTERS[optIndex]}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Option ${OPTION_LETTERS[optIndex]} text`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        required
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-opt-del"
                          onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                          title="Remove option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {q.options.length < 6 && (
                    <button
                      type="button"
                      className="btn-link mt-2"
                      onClick={() => addOptionToQuestion(qIndex)}
                    >
                      + Add another option
                    </button>
                  )}
                </div>

                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="input-explanation"
                    placeholder="Optional explanation shown on the post-test results page"
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button type="button" className="btn-secondary" onClick={addQuestion}>
              + Add Another Question
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-submit-row">
          <Link to="/admin/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating Quiz & Code…" : "Publish Quiz & Generate Code →"}
          </button>
        </div>
      </form>
    </div>
  );
}
