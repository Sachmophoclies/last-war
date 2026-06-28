import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import versionData from "../data/version.json";
import ProblemModal from "./ProblemModal";
import { NAV_TREE } from "../data/navigation.js";

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

function NavItems({ nodes, keyPrefix = "", close, openNodes, toggle, firstRef }) {
  return nodes
    .filter(node => !node.homeOnly)
    .map((node, i) => {
      const key = keyPrefix ? `${keyPrefix}.${i}` : `${i}`;
      const isOpen = openNodes.has(key);

      if (node.href) {
        return (
          <li key={key}>
            <a href={node.href} target="_blank" rel="noreferrer" onClick={close}>
              {node.title}
            </a>
          </li>
        );
      }

      if (node.path) {
        return (
          <li key={key}>
            <NavLink
              to={node.path}
              onClick={close}
              className={({ isActive }) => isActive ? "active" : ""}
              ref={key === "0" ? firstRef : undefined}
            >
              {node.title}
            </NavLink>
          </li>
        );
      }

      // Branch node
      return (
        <li key={key}>
          <button
            className={`menu-toggle ${isOpen ? "open" : ""}`}
            onClick={() => toggle(key)}
            aria-expanded={isOpen}
            ref={key === "0" ? firstRef : undefined}
          >
            {node.title} <span className="arrow">{isOpen ? "▼" : "▶"}</span>
          </button>
          {isOpen && (
            <ul className="submenu">
              <NavItems
                nodes={node.children}
                keyPrefix={key}
                close={close}
                openNodes={openNodes}
                toggle={toggle}
                firstRef={undefined}
              />
            </ul>
          )}
        </li>
      );
    });
}

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [openNodes, setOpenNodes] = useState(new Set());
  const close = () => setOpen(false);
  const drawerRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  const toggle = (key) =>
    setOpenNodes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
      document.body.removeAttribute("data-theme");
    } else {
      setDarkMode(true);
      document.body.setAttribute("data-theme", "dark");
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
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
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
          <NavItems
            nodes={NAV_TREE}
            close={close}
            openNodes={openNodes}
            toggle={toggle}
            firstRef={firstMenuItemRef}
          />
        </ul>

        <div className="settings">
          <div
            className="setting-item"
            onClick={() => setProblemModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <span>Problem?</span>
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

        <div style={{
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)'
        }}>
          v{versionData.version} ({versionData.date})
        </div>
      </nav>

      <ProblemModal
        isOpen={problemModalOpen}
        onClose={() => setProblemModalOpen(false)}
      />
    </>
  );
}
