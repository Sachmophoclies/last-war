import { useNavigate, useLocation } from "react-router-dom";
import Results from "../../../components/Results.jsx";
import Footer from "../../../components/Footer.jsx";

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  return (
    <div className="page">
      <h1>Results</h1>
      <Results data={data} />
      <Footer onBack={() => navigate(-1)} />
    </div>
  );
}
