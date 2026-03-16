import React from "react";
import LevelCard from "../components/LevelCard";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1>LinguaPlay 🇯🇵</h1>
      <p className="subtitle">
        Learn Japanese step-by-step using JLPT-based flashcards
      </p>

      <div className="levels-container">
        <LevelCard
          level="N5"
          title="JLPT N5"
          description="Basic words, greetings, and simple sentences for beginners."
        />
        <LevelCard
          level="N4"
          title="JLPT N4"
          description="Elementary grammar and daily-use vocabulary."
        />
        <LevelCard
          level="N3"
          title="JLPT N3"
          description="Intermediate grammar and conversational Japanese."
        />
        <LevelCard
          level="N2"
          title="JLPT N2"
          description="Advanced grammar, reading, and comprehension."
        />
        <LevelCard
          level="N1"
          title="JLPT N1"
          description="Master-level Japanese used in academics and media."
        />
      </div>
    </div>
  );
};

export default Home;
