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
  const [debugMode, setDebugMode] = useState(false);
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

  // Load debug mode from cookie on mount
  useEffect(() => {
    const savedDebugMode = getCookie("debugMode");
    if (savedDebugMode === "true") {
      setDebugMode(true);
      document.body.setAttribute("data-debug", "true");
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

  // Toggle debug mode
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);

    if (newMode) {
      document.body.setAttribute("data-debug", "true");
      setCookie("debugMode", "true");
    } else {
      document.body.removeAttribute("data-debug");
      setCookie("debugMode", "false");
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
            className={`setting-item ${debugMode ? 'active' : ''}`}
            onClick={toggleDebugMode}
          >
            <span>Debug</span>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={toggleDebugMode}
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
