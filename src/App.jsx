import { Routes, Route } from "react-router-dom";
import HamburgerMenu from "./components/HamburgerMenu.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Home from "./pages/Home.jsx";
import SundayGathering from "./pages/SundayGathering/SundayGathering.jsx";
import UnitProgression from "./pages/ArmsRace/UnitProgression/UnitProgression.jsx";
import ResultsPage from "./pages/ArmsRace/UnitProgression/ResultsPage.jsx";
import AboutMe from "./pages/AboutMe.jsx";
import AboutApp from "./pages/AboutApp.jsx";
import AboutSatch from "./pages/AboutSatch.jsx";
import Shoutouts from "./pages/Shoutouts.jsx";
import DynamicGuide from "./pages/Guides/DynamicGuide.jsx";
import Season from "./pages/Guides/Season.jsx";

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
          <Route path="/sunday-gathering" element={<SundayGathering />} />
          <Route path="/unit-progression" element={<UnitProgression />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/about/app" element={<AboutApp />} />
          <Route path="/about/satch" element={<AboutSatch />} />
          <Route path="/shoutouts" element={<Shoutouts />} />

          {/* Season Routes */}
          <Route path="/guides/seasons/:seasonNumber" element={<Season />} />

          {/* All Guides - Dynamic Route */}
          <Route path="/guides/*" element={<DynamicGuide />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CookieConsent />
    </div>
  );
}
