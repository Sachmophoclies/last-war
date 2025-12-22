import { useParams, Navigate } from "react-router-dom";
import content from "../../data/content.json";
import BackButton from "../../components/BackButton.jsx";

export default function Season() {
  const { seasonNumber } = useParams();

  // Get season data from content.json
  const seasonData = content.seasons?.[seasonNumber];

  // If season not found, redirect to 404
  if (!seasonData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="page">
      <h1>{seasonData.title}</h1>

      <div className="card">
        <p>{seasonData.description}</p>
      </div>

      <BackButton />
    </div>
  );
}
