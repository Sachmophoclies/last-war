import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HamburgerMenu from "./components/HamburgerMenu.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import UnitProgression from "./pages/ArmsRace/UnitProgression/UnitProgression.jsx";
import ResultsPage from "./pages/ArmsRace/UnitProgression/ResultsPage.jsx";
import AboutMe from "./pages/AboutMe.jsx";
import Shoutouts from "./pages/Shoutouts.jsx";

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  const [showFooter, setShowFooter] = useState(true);

  // Check if user has interacted before
  useEffect(() => {
    const hasInteracted = localStorage.getItem("hasInteracted");
    if (hasInteracted === "true") {
      setShowFooter(false);
    }
  }, []);

  // Hide footer on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      localStorage.setItem("hasInteracted", "true");
      setShowFooter(false);
      // Remove event listeners after first interaction
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    if (showFooter) {
      document.addEventListener("click", handleInteraction);
      document.addEventListener("keydown", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);

      return () => {
        document.removeEventListener("click", handleInteraction);
        document.removeEventListener("keydown", handleInteraction);
        document.removeEventListener("touchstart", handleInteraction);
      };
    }
  }, [showFooter]);

  return (
    <div className="app">
      <HamburgerMenu />

      <main className="content">
        <Routes>
          <Route path="/" element={<UnitProgression />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/shoutouts" element={<Shoutouts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && (
        <div className="sticky-footer">
          This is a passion project. No information is stored.
        </div>
      )}

      <CookieConsent />
    </div>
  );
}
