import { useState } from "react";
import { useNavigate } from "react-router-dom";
import content from "../data/content.json";

export default function Home() {
  const navigate = useNavigate();
  const [breadcrumb, setBreadcrumb] = useState([]);

  // Define menu structure
  const menuStructure = [
    {
      title: "Satch's Utilities",
      children: [
        { title: "Arms Race", path: "/unit-progression" }
      ]
    },
    {
      title: "External Guides",
      children: [
        {
          title: "Squad",
          children: [
            { title: "Hero Guide", path: "/guides/squad/basic-setup" },
            {
              title: "Skills",
              children: [
                { title: "Tank Heroes", path: "/guides/squad/skills/tank-heroes" },
                { title: "Air Heroes", path: "/guides/squad/skills/air-heroes" }
              ]
            },
            {
              title: "Equipment",
              children: [
                { title: "Leveling Guide", path: "/guides/squad/equipment/leveling-guide" },
                { title: "Resource Cost", path: "/guides/squad/equipment/resource-cost" }
              ]
            }
          ]
        },
        {
          title: "Buildings",
          children: [
            {
              title: "HQ",
              children: [
                { title: "1-30", path: "/guides/buildings/hq/1-30" },
                { title: "25-30", path: "/guides/buildings/hq/25-30" }
              ]
            }
          ]
        },
        { title: "Store", path: "/guides/store" },
        {
          title: "Events",
          children: [
            { title: "Wanted Boss", path: "/guides/events/wanted-boss" },
            { title: "Desert Storm", path: "/guides/events/desert-storm" }
          ]
        },
        {
          title: "Seasons",
          children: [
            { title: "Season 1", path: "/guides/seasons/1" },
            { title: "Season 2", path: "/guides/seasons/2" },
            { title: "Season 3", path: "/guides/seasons/3" },
            { title: "Season 4", path: "/guides/seasons/4" },
            { title: "Season 5", path: "/guides/seasons/5" },
            { title: "Season 6", path: "/guides/seasons/6" }
          ]
        }
      ]
    },
    {
      title: "About",
      children: [
        { title: "This App", path: "/about/app" },
        { title: "Satch", path: "/about/satch" }
      ]
    },
    { title: "Shoutouts", path: "/shoutouts" }
  ];

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
      // Navigate to the page
      navigate(item.path);
    } else if (item.children) {
      // Show children
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
