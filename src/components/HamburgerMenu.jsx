import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const PACK_URL = "https://www.lastwar.com/"; // official site :contentReference[oaicite:1]{index=1}

// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [betaMode, setBetaMode] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [buildingsOpen, setBuildingsOpen] = useState(false);
  const [hqOpen, setHqOpen] = useState(false);
  const close = () => setOpen(false);
  const drawerRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
      document.body.removeAttribute("data-theme");
    } else {
      // Default to dark mode if no preference or if dark is saved
      setDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
    }
  }, []);

  // Load beta mode from cookie on mount
  useEffect(() => {
    const savedBetaMode = getCookie("betaMode");
    if (savedBetaMode === "true") {
      setBetaMode(true);
      document.body.setAttribute("data-beta", "true");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  };

  // Toggle beta mode
  const toggleBetaMode = () => {
    const newMode = !betaMode;
    setBetaMode(newMode);

    if (newMode) {
      document.body.setAttribute("data-beta", "true");
      setCookie("betaMode", "true");
    } else {
      document.body.removeAttribute("data-beta");
      setCookie("betaMode", "false");
    }
  };

  // Handle Escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus management: focus first menu item when drawer opens
  useEffect(() => {
    if (open && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    }
  }, [open]);

  // Focus trap: keep focus within drawer when open
  useEffect(() => {
    if (!open) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusableElements = drawer.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if focus is on first element, move to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focus is on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [open]);

  return (
    <>
      <header className="topbar">
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
        <div className="brand">Last War Helper</div>
      </header>

      {open && <div className="backdrop" onClick={close} />}

      <nav className={`drawer ${open ? "open" : ""}`} aria-label="Main" ref={drawerRef}>
        <div className="drawerHeader">
          <div className="drawerTitle">Menu</div>
          <button className="closeBtn" aria-label="Close menu" onClick={close}>✕</button>
        </div>

        <ul className="menu">
          <li>
            <NavLink
              to="/"
              end
              onClick={close}
              className={({isActive}) => isActive ? "active" : ""}
              ref={firstMenuItemRef}
            >
              Arms Race
            </NavLink>
          </li>

          {betaMode && (
            <li>
              <button
                className={`menu-toggle ${guidesOpen ? 'open' : ''}`}
                onClick={() => setGuidesOpen(!guidesOpen)}
                aria-expanded={guidesOpen}
              >
                External Guides <span className="arrow">{guidesOpen ? '▼' : '▶'}</span>
              </button>
              {guidesOpen && (
                <ul className="submenu">
                  <li>
                    <button
                      className={`menu-toggle ${skillsOpen ? 'open' : ''}`}
                      onClick={() => setSkillsOpen(!skillsOpen)}
                      aria-expanded={skillsOpen}
                    >
                      Skills <span className="arrow">{skillsOpen ? '▼' : '▶'}</span>
                    </button>
                    {skillsOpen && (
                      <ul className="submenu">
                        <li>
                          <NavLink to="/guides/skills/tank-heroes" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                            Tank Heroes
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/guides/skills/air-heroes" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                            Air Heroes
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <NavLink to="/guides/equipment" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                      Equipment
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/guides/store" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                      Store
                    </NavLink>
                  </li>
                  <li>
                    <button
                      className={`menu-toggle ${buildingsOpen ? 'open' : ''}`}
                      onClick={() => setBuildingsOpen(!buildingsOpen)}
                      aria-expanded={buildingsOpen}
                    >
                      Buildings <span className="arrow">{buildingsOpen ? '▼' : '▶'}</span>
                    </button>
                    {buildingsOpen && (
                      <ul className="submenu">
                        <li>
                          <button
                            className={`menu-toggle ${hqOpen ? 'open' : ''}`}
                            onClick={() => setHqOpen(!hqOpen)}
                            aria-expanded={hqOpen}
                          >
                            HQ <span className="arrow">{hqOpen ? '▼' : '▶'}</span>
                          </button>
                          {hqOpen && (
                            <ul className="submenu">
                              <li>
                                <NavLink to="/guides/buildings/hq/1-30" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                                  1-30
                                </NavLink>
                              </li>
                              <li>
                                <NavLink to="/guides/buildings/hq/25-30" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                                  25-30
                                </NavLink>
                              </li>
                            </ul>
                          )}
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <NavLink to="/guides/research" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
                      Research
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          )}

          <li>
            <NavLink to="/about" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
              About me
            </NavLink>
          </li>
          <li>
            <NavLink to="/shoutouts" onClick={close} className={({isActive}) => isActive ? "active" : ""}>
              Shoutouts
            </NavLink>
          </li>
          <li>
            <a href={PACK_URL} target="_blank" rel="noreferrer" onClick={close}>
              Official Site
            </a>
          </li>
        </ul>

        <div className="settings">
          <div
            className={`setting-item ${betaMode ? 'active' : ''}`}
            onClick={toggleBetaMode}
          >
            <span>Beta</span>
            <input
              type="checkbox"
              checked={betaMode}
              onChange={toggleBetaMode}
              disabled
              tabIndex={-1}
            />
          </div>
          <div
            className={`setting-item ${darkMode ? 'active' : ''}`}
            onClick={toggleDarkMode}
          >
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              tabIndex={-1}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
