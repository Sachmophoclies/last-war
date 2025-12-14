import { useState, useEffect } from "react";

const CONSENT_COOKIE_NAME = "cookie-consent";
const CONSENT_COOKIE_VALUE = "accepted";
const CONSENT_COOKIE_EXPIRY_DAYS = 365;

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set consent cookie with 1 year expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_COOKIE_EXPIRY_DAYS);
    document.cookie = `${CONSENT_COOKIE_NAME}=${CONSENT_COOKIE_VALUE}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;

    setShowBanner(false);
  };

  const declineCookies = () => {
    // Redirect to Google if user declines
    window.location.href = "https://www.google.com";
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-backdrop">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          <h3>Cookie Notice</h3>
          <p>
            This site uses essential cookies to store your preferences and settings locally.
            I do not use any tracking, analytics, or marketing cookies. Your data stays on your device.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button onClick={declineCookies} className="cookie-consent-decline">
            Decline
          </button>
          <button onClick={acceptCookies} className="cookie-consent-accept">
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
