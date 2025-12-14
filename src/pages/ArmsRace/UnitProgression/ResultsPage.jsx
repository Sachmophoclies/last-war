import { useNavigate, useLocation } from "react-router-dom";
import Results from "../../../components/Results.jsx";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="page">
      <h1>Results</h1>
      <Results data={data} />

      <div className="desktop-actions">
        <button className="desktop-action-btn back" onClick={goBack} aria-label="Go Back">
          ←
        </button>
      </div>

      <div className="mobile-footer">
        <div className="mobile-footer-back" onClick={goBack}>
          <span>←</span>
        </div>
      </div>
    </div>
  );
}
