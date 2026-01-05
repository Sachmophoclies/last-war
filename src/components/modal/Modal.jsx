import { useEffect, useRef } from "react";
import "./Modal.css";
import Footer from "./Footer";

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap: keep focus within modal when open
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
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
  }, [isOpen]);

  if (!isOpen) return null;

  // Separate children into body and footer
  const body = [];
  const footer = [];

  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child?.type === Footer) {
        footer.push(child);
      } else {
        body.push(child);
      }
    });
  } else {
    if (children?.type === Footer) {
      footer.push(children);
    } else {
      body.push(children);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" ref={modalRef}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" aria-label="Close modal" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-content">
          {body}
        </div>
        {footer.length > 0 && (
          <>
            <div className="modal-divider" />
            <div className="modal-footer">
              {footer}
            </div>
          </>
        )}
      </div>
    </>
  );
}

Modal.Footer = Footer;

export default Modal;
