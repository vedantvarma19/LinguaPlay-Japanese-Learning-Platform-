import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Quiz.css";

const Quiz = () => {
  const { level } = useParams(); // JLPT level from URL
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const jlptLevel = level || "N5";

  /* ===============================
     FETCH FLASHCARDS (LEVEL-WISE)
  ================================ */
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);

        const res = await API.get(
          `/flashcards/japanese/${jlptLevel}`
        );

        setCards(Array.isArray(res.data) ? res.data : []);
        setCurrent(0);
        setScore(0);
      } catch (err) {
        console.error(
          err?.response?.data?.message ||
            "Failed to load quiz flashcards"
        );
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [jlptLevel]);

  /* ===============================
     GENERATE OPTIONS
  ================================ */
  useEffect(() => {
    if (!cards[current]) return;

    const correct = cards[current].meaning;

    const wrongOptions = cards
      .filter((_, index) => index !== current)
      .map((c) => c.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    setOptions(
      [...wrongOptions, correct].sort(() => 0.5 - Math.random())
    );
    setSelected(null);
  }, [current, cards]);

  /* ===============================
     HANDLE ANSWER
  ================================ */
  const handleAnswer = (option) => {
    if (selected) return;

    setSelected(option);
    if (option === cards[current].meaning) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    setCurrent((prev) => prev + 1);
  };

  const handleLevelChange = (e) => {
    navigate(`/quiz/${e.target.value}`);
  };

  /* ===============================
     UI STATES
  ================================ */
  if (loading)
    return <h2 className="quiz-loading">Loading Quiz...</h2>;

  if (cards.length === 0)
    return (
      <h2 className="quiz-loading">
        No questions available
      </h2>
    );

  /* ===============================
     QUIZ FINISHED
  ================================ */
  if (current >= cards.length) {
    return (
      <div className="quiz-container quiz-complete">
        <h2>🎉 JLPT {jlptLevel} Quiz Completed</h2>

        <p className="quiz-score-live">
          Score: <strong>{score}</strong> /{" "}
          {cards.length}
        </p>

        <button
          className="next-btn"
          onClick={() =>
            navigate(`/flashcards/${jlptLevel}`)
          }
        >
          Back to JLPT {jlptLevel} Flashcards
        </button>
      </div>
    );
  }

  /* ===============================
     QUIZ UI
  ================================ */
  return (
    <div className="quiz-container">
      <h2 className="quiz-title">
        JLPT {jlptLevel} Quiz
      </h2>

      {/* 🔽 JLPT LEVEL SELECT */}
      <select
        value={jlptLevel}
        onChange={handleLevelChange}
        style={{
          marginBottom: "15px",
          padding: "6px 12px"
        }}
      >
        <option value="N5">JLPT N5</option>
        <option value="N4">JLPT N4</option>
        <option value="N3">JLPT N3</option>
        <option value="N2">JLPT N2</option>
        <option value="N1">JLPT N1</option>
      </select>

      <p className="quiz-progress">
        Question {current + 1} / {cards.length}
      </p>

      <div className="quiz-card">
        <span className="quiz-word">
          {cards[current].word}
        </span>
      </div>

      <div className="quiz-options">
        {options.map((opt, index) => (
          <button
            key={index}
            className={`option ${
              selected
                ? opt === cards[current].meaning
                  ? "correct"
                  : opt === selected
                  ? "wrong"
                  : ""
                : ""
            }`}
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected && (
        <button
          className="next-btn"
          onClick={nextQuestion}
        >
          Next
        </button>
      )}

      <p className="quiz-score-live">
        Score: {score}
      </p>
    </div>
  );
};

export default Quiz;
