import { useState, useEffect } from "react";
import content from "../data/content.json";

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
          <h3>{content.cookies.title}</h3>
          <p>
            {content.cookies.message}
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button onClick={declineCookies} className="cookie-consent-decline">
            {content.cookies.decline}
          </button>
          <button onClick={acceptCookies} className="cookie-consent-accept">
            {content.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
