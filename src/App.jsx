import { Routes, Route } from "react-router-dom";
import HamburgerMenu from "./components/HamburgerMenu.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Home from "./pages/Home.jsx";
import UnitProgression from "./pages/ArmsRace/UnitProgression/UnitProgression.jsx";
import ResultsPage from "./pages/ArmsRace/UnitProgression/ResultsPage.jsx";
import AboutMe from "./pages/AboutMe.jsx";
import AboutApp from "./pages/AboutApp.jsx";
import AboutSatch from "./pages/AboutSatch.jsx";
import Shoutouts from "./pages/Shoutouts.jsx";

// Squad guides
import BasicSetup from "./pages/Guides/Squad/BasicSetup.jsx";
import SkillsTankHeroes from "./pages/Guides/Squad/Skills/TankHeroes.jsx";
import SkillsAirHeroes from "./pages/Guides/Squad/Skills/AirHeroes.jsx";
import EquipmentLevelingGuide from "./pages/Guides/Squad/Equipment/LevelingGuide.jsx";
import EquipmentResourceCost from "./pages/Guides/Squad/Equipment/ResourceCost.jsx";

// Buildings guides
import BuildingsHQ1_30 from "./pages/Guides/Buildings/HQ/HQ1_30.jsx";
import BuildingsHQ25_30 from "./pages/Guides/Buildings/HQ/HQ25_30.jsx";

// Store guide
import Store from "./pages/Guides/Store.jsx";

// Events guides
import WantedBoss from "./pages/Guides/Events/WantedBoss.jsx";
import DesertStorm from "./pages/Guides/Events/DesertStorm.jsx";

// Test guides
import TestWithNoAuthor from "./pages/Guides/Test/TestWithNoAuthor.jsx";
import TestWithAuthorNoUrl from "./pages/Guides/Test/TestWithAuthorNoUrl.jsx";

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
          <Route path="/" element={<Home />} />
          <Route path="/unit-progression" element={<UnitProgression />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/about/app" element={<AboutApp />} />
          <Route path="/about/satch" element={<AboutSatch />} />
          <Route path="/shoutouts" element={<Shoutouts />} />

          {/* Squad Guides */}
          <Route path="/guides/squad/basic-setup" element={<BasicSetup />} />
          <Route path="/guides/squad/skills/tank-heroes" element={<SkillsTankHeroes />} />
          <Route path="/guides/squad/skills/air-heroes" element={<SkillsAirHeroes />} />
          <Route path="/guides/squad/equipment/leveling-guide" element={<EquipmentLevelingGuide />} />
          <Route path="/guides/squad/equipment/resource-cost" element={<EquipmentResourceCost />} />

          {/* Buildings Guides */}
          <Route path="/guides/buildings/hq/1-30" element={<BuildingsHQ1_30 />} />
          <Route path="/guides/buildings/hq/25-30" element={<BuildingsHQ25_30 />} />

          {/* Store Guide */}
          <Route path="/guides/store" element={<Store />} />

          {/* Events Guides */}
          <Route path="/guides/events/wanted-boss" element={<WantedBoss />} />
          <Route path="/guides/events/desert-storm" element={<DesertStorm />} />

          {/* Test Guides */}
          <Route path="/guides/test/no-author" element={<TestWithNoAuthor />} />
          <Route path="/guides/test/author-no-url" element={<TestWithAuthorNoUrl />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CookieConsent />
    </div>
  );
}
