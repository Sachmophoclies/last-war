import { useLocation, Navigate } from "react-router-dom";
import GuideImage from "../../components/GuideImage.jsx";
import guidesData from "../../data/guides.json";

export default function DynamicGuide() {
  const location = useLocation();

  // Extract guide ID from path (remove /guides/ prefix)
  const guideId = location.pathname.replace('/guides/', '');

  // Find the guide by ID
  const guide = guidesData.guides.find(g => g.id === guideId);

  // If guide not found, redirect to 404
  if (!guide) {
    return <Navigate to="/404" replace />;
  }

  // Validation: If no author is provided, authorUrl must be null
  if (!guide.author && guide.authorUrl !== undefined && guide.authorUrl !== null) {
    throw new Error(
      `Invalid guide configuration for "${guide.title}" (ID: ${guide.id}): ` +
      `authorUrl must be null when author is not provided. Got: ${guide.authorUrl}`
    );
  }

  // Pass guide data to GuideImage component
  return (
    <GuideImage
      title={guide.title}
      imageUrl={guide.imageUrl}
      author={guide.author}
      authorUrl={guide.authorUrl}
      trusted={guide.trusted}
    />
  );
}
