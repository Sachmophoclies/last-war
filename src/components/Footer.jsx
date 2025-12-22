export default function Footer({
  onBack = null,
  onCheck = null,
  onClear = null,
  backColor = '#f59e0b'
}) {
  return (
    <>
      {/* Desktop Actions */}
      <div className="desktop-actions">
        {onBack && (
          <button
            className="desktop-action-btn"
            onClick={onBack}
            aria-label="Go Back"
            style={{ background: backColor }}
          >
            ←
          </button>
        )}
        {onCheck && (
          <button
            className="desktop-action-btn check"
            onClick={onCheck}
            aria-label="View Results"
          >
            ✓
          </button>
        )}
        {onClear && (
          <button
            className="desktop-action-btn clear"
            onClick={onClear}
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mobile Footer */}
      <div className="mobile-footer">
        {onBack && (
          <div
            className="mobile-footer-back"
            onClick={onBack}
            style={{ background: backColor }}
          >
            <span>←</span>
          </div>
        )}
        {onCheck && (
          <div className="mobile-footer-check" onClick={onCheck}>
            <span>✓</span>
          </div>
        )}
        {onClear && (
          <div className="mobile-footer-clear" onClick={onClear}>
            <span>✕</span>
          </div>
        )}
      </div>
    </>
  );
}
