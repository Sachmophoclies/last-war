import { useState } from "react";
import { useNavigate } from "react-router-dom";
import content from "../data/content.json";
import { NAV_TREE } from "../data/navigation.js";

export default function Home() {
  const navigate = useNavigate();
  const [breadcrumb, setBreadcrumb] = useState([]);

  const menuStructure = NAV_TREE.filter(node => !node.menuOnly);

  // Get current menu items based on breadcrumb
  const getCurrentMenuItems = () => {
    if (breadcrumb.length === 0) {
      return menuStructure;
    }

    let current = menuStructure;
    for (const index of breadcrumb) {
      current = current[index].children;
    }
    return current;
  };

  const handleCardClick = (item, index) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.children) {
      setBreadcrumb([...breadcrumb, index]);
    }
  };

  const handleBack = () => {
    setBreadcrumb(breadcrumb.slice(0, -1));
  };

  const currentItems = getCurrentMenuItems();

  return (
    <div className="page">
      <h1>Last War Helper</h1>

      {/* Sticky description card */}
      <div className="card" style={{ position: 'sticky', top: '60px', zIndex: 10, paddingTop: '0', paddingBottom: '0' }}>
        <p style={{ margin: 0, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {content.home.description}
        </p>
      </div>

      {/* Menu cards */}
      {currentItems.map((item, index) => (
        <div key={index} className="card" onClick={() => handleCardClick(item, index)} style={{ cursor: 'pointer' }}>
          <h2 style={{ margin: 0, textAlign: 'center' }}>
            {item.title}
            {item.children && <span style={{ marginLeft: '8px' }}>→</span>}
          </h2>
        </div>
      ))}

      {/* Back button at bottom if navigated into submenu */}
      {breadcrumb.length > 0 && (
        <>
          <div className="desktop-actions">
            <button className="desktop-action-btn" onClick={handleBack} aria-label="Go Back" style={{ background: '#f59e0b' }}>
              ←
            </button>
          </div>

          <div className="mobile-footer">
            <div className="mobile-footer-check" onClick={handleBack} style={{ background: '#f59e0b' }}>
              <span>←</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
