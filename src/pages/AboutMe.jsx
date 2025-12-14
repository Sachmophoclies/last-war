import { useState, useMemo } from "react";

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const FIRST_FACT = "I started Last War: Survival on Apr 29th 2025. I got kicked out of an alliance and got picked up by MMMP. I am a low spender. I try to use math to beat the whales.";

const OTHER_FACTS = [
  "I was born in Cleveland and grew up in Ft. Lauderdale, FL.",
  "I cooked in restaurants for 15 years until Covid closed down. I went back to school and got my BS in Computer Science.",
  "I live in New England.",
  "I like turtles.",
  "I'm bald.",
  "I like astronomy.",
  "I still don't know who let the dogs out.",
  "I'm a millenial."
];

export default function AboutMe() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Randomize the list once on mount
  const randomizedFacts = useMemo(() => {
    return [FIRST_FACT, ...shuffleArray(OTHER_FACTS)];
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
