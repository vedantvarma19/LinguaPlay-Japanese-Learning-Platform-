import React from "react";
import { useNavigate } from "react-router-dom";
import "./LevelCard.css";

const LevelCard = ({ level, title, description }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/flashcards/${level}`);
  };

  return (
    <div className="level-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={handleStart}>Start Learning</button>
    </div>
  );
};

export default LevelCard;
