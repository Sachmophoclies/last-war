import { useState, useRef, useEffect } from "react";

export default function InfoIcon({ text }) {
  const [showPopup, setShowPopup] = useState(false);
  const iconRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (showPopup && iconRef.current && popupRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      const popupWidth = popup.offsetWidth;
      const popupHeight = popup.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check if popover would extend off the right side or top of screen
      const wouldOverflowRight = iconRect.right + popupWidth > viewportWidth - 20;
      const wouldOverflowTop = iconRect.top - popupHeight < 20;

      if (wouldOverflowRight || wouldOverflowTop) {
        // Center the popover on screen
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
      } else {
        // Position popover so its bottom-left is at the icon's top-right
        popup.style.left = `${iconRect.right}px`;
        popup.style.top = `${iconRect.top}px`;
        popup.style.transform = 'translateY(-100%)';
      }
    }
  }, [showPopup]);

  return (
    <>
      <span
        ref={iconRef}
        className="info-icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPopup(true);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setShowPopup(true);
          }
        }}
      >
        ⓘ
      </span>

      {showPopup && (
        <div className="info-popup-backdrop" onClick={() => setShowPopup(false)}>
          <div
            ref={popupRef}
            className="info-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="info-popup-close-x"
              onClick={() => setShowPopup(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="info-popup-content">
              <p>{text}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
