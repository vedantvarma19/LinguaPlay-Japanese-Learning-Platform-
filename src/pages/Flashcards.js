import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import correctSound from "../assets/sounds/correct.mp3";
import flipSound from "../assets/sounds/flip.mp3";

import API from "../services/api";
import {
  getProgress,
  markKnown as markKnownAPI
} from "../services/progressService";

import "./Flashcards.css";

const Flashcards = () => {
  const { level } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [known, setKnown] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [xp, setXp] = useState(0);
  const [jlptLevel, setJlptLevel] = useState(level || "N5");
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const correctAudio = useRef(new Audio(correctSound));
  const flipAudio = useRef(new Audio(flipSound));

  /* ===============================
     DERIVED VALUES
  ================================ */
  const userLevel = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;

  const knownInCurrentLevel = known.filter((id) =>
    flashcards.some((card) => card._id === id)
  );

  /* ===============================
     FETCH FLASHCARDS (FIXED)
  ================================ */
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/flashcards/japanese/${jlptLevel}`);
      setFlashcards(res.data || []);
      setCurrent(0);
      setFlipped(false);
    } catch (err) {
      console.error("Failed to fetch flashcards", err);
    } finally {
      setLoading(false);
    }
  }, [jlptLevel]);

  /* ===============================
     LOAD USER PROGRESS
  ================================ */
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await getProgress();
        setXp(res.data.xp || 0);
        setKnown(res.data.knownFlashcards || []);
        setJlptLevel(res.data.jlptLevel || "N5");
      } catch {
        console.log("No saved progress");
      }
    };

    loadProgress();
  }, []);

  /* ===============================
     SYNC URL LEVEL
  ================================ */
  useEffect(() => {
    if (level && level !== jlptLevel) {
      setJlptLevel(level);
    }
  }, [level, jlptLevel]);

  /* ===============================
     FETCH ON LEVEL CHANGE
  ================================ */
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const currentCard = flashcards[current];

  /* ===============================
     MARK FLASHCARD AS KNOWN
  ================================ */
  const markKnown = async () => {
    if (!currentCard || marking) return;

    if (known.includes(currentCard._id)) {
      nextCard();
      return;
    }

    setMarking(true);

    try {
      correctAudio.current.currentTime = 0;
      correctAudio.current.play();

      const res = await markKnownAPI(currentCard._id);

      setXp(res.data.xp);
      setKnown(res.data.knownFlashcards || []);

      setTimeout(() => {
        setFlipped(false);
        nextCard();
        setMarking(false);
      }, 250);
    } catch (err) {
      console.error("Mark known failed", err);
      setMarking(false);
    }
  };

  /* ===============================
     NAVIGATION
  ================================ */
  const nextCard = () => {
    if (current < flashcards.length - 1) {
      setCurrent((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
      setFlipped(false);
    }
  };

  const handleFlip = () => {
    flipAudio.current.currentTime = 0;
    flipAudio.current.play();
    setFlipped((prev) => !prev);
  };

  const handleLevelChange = (e) => {
    const selected = e.target.value;
    navigate(`/flashcards/${selected}`);
    setJlptLevel(selected);
  };

  /* ===============================
     UI STATES
  ================================ */
  if (loading) return <h2 className="loading">Loading flashcards...</h2>;
  if (!currentCard) return <h2>No flashcards found</h2>;

  return (
    <div className="flashcards-container">
      <div className="content-card">
        <h1>Japanese Flashcards</h1>

        <select value={jlptLevel} onChange={handleLevelChange}>
          <option value="N5">JLPT N5 (Beginner)</option>
          <option value="N4">JLPT N4</option>
          <option value="N3">JLPT N3</option>
          <option value="N2">JLPT N2</option>
          <option value="N1">JLPT N1 (Advanced)</option>
        </select>

        <div className="stats-card">
          <div className="level-box">
            <strong>Level {userLevel}</strong>
            <span>{xp} XP</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          <p className="progress-text">
            Known: {knownInCurrentLevel.length} / {flashcards.length}
          </p>
        </div>

        <div className="flashcard-wrapper">
          <div
            className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={handleFlip}
          >
            <div className="card-face card-front">
              <span className="jp-word">{currentCard.word}</span>
            </div>

            <div className="card-face card-back">
              <div>
                <strong>{currentCard.meaning}</strong>
                {currentCard.reading && (
                  <p style={{ fontSize: "14px", opacity: 0.7 }}>
                    {currentCard.reading}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="hint">Click card to flip</p>

        <button
          className="known-btn"
          onClick={markKnown}
          disabled={marking}
        >
          Known +10 XP
        </button>

        <div className="nav-buttons">
          <button onClick={prevCard} disabled={current === 0}>
            Previous
          </button>
          <button
            onClick={nextCard}
            disabled={current === flashcards.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
