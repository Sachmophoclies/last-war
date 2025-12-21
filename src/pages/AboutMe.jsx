import { useState, useMemo } from "react";
import aboutMeData from "../data/aboutMe.json";

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function AboutMe() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Randomize the list once on mount
  const randomizedFacts = useMemo(() => {
    return [aboutMeData.FIRST_FACT, ...shuffleArray(aboutMeData.OTHER_FACTS)];
  }, []);

  const handleClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % randomizedFacts.length);
  };

  return (
    <div className="page">
      <h1>About me</h1>

      <div className="card clickable-card" onClick={handleClick}>
        <p>{randomizedFacts[currentIndex]}</p>
        <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Click for more
        </div>
      </div>
    </div>
  );
}
