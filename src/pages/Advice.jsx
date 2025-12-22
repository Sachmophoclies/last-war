import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

export default function Advice() {
  const navigate = useNavigate();
  const playerLevel = getCookie("playerLevel");

  // Redirect to home if no level is set
  useEffect(() => {
    if (!playerLevel) {
      navigate("/");
    }
  }, [playerLevel, navigate]);

  // Get advice based on level
  const getAdvice = () => {
    if (playerLevel === "0" || playerLevel === "1") {
      return {
        title: "Welcome, Free to Play / Low Spender!",
        message: "Check out the External Guides in the menu to find helpful strategies and tips."
      };
    } else if (playerLevel === "2" || playerLevel === "3") {
      return {
        title: "Welcome, Spender!",
        message: "Check out my utilities in the menu to optimize your gameplay and maximize efficiency."
      };
    }
    return null;
  };

  const advice = getAdvice();

  if (!advice) {
    return null;
  }

  return (
    <div className="page">
      <h1>{advice.title}</h1>
      <div className="card">
        <p style={{ textAlign: 'center', margin: 0 }}>{advice.message}</p>
      </div>
    </div>
  );
}
