import { Routes, Route } from "react-router-dom";
import HamburgerMenu from "./components/HamburgerMenu.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import UnitProgression from "./pages/ArmsRace/UnitProgression/UnitProgression.jsx";
import ResultsPage from "./pages/ArmsRace/UnitProgression/ResultsPage.jsx";
import AboutMe from "./pages/AboutMe.jsx";
import Shoutouts from "./pages/Shoutouts.jsx";

// Skills guides
import SkillsTankHeroes from "./pages/Guides/Skills/TankHeroes.jsx";
import SkillsAirHeroes from "./pages/Guides/Skills/AirHeroes.jsx";
import SkillsMissileHeroes from "./pages/Guides/Skills/MissileHeroes.jsx";

// Other guides
import Equipment from "./pages/Guides/Equipment.jsx";

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <HamburgerMenu />

      <main className="content">
        <Routes>
          <Route path="/" element={<UnitProgression />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/shoutouts" element={<Shoutouts />} />

          {/* Skills Guides */}
          <Route path="/guides/skills/tank-heroes" element={<SkillsTankHeroes />} />
          <Route path="/guides/skills/air-heroes" element={<SkillsAirHeroes />} />
          <Route path="/guides/skills/missile-heroes" element={<SkillsMissileHeroes />} />

          {/* Other Guides */}
          <Route path="/guides/equipment" element={<Equipment />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CookieConsent />
    </div>
  );
}
