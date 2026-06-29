import { useLocation, Navigate } from "react-router-dom";
import GuideImage from "../../components/GuideImage.jsx";
import { findPageByPath } from "../../data/pages.js";

export default function DynamicGuide() {
  const location = useLocation();
  const page = findPageByPath(location.pathname);

  if (!page || !page.content) {
    return <Navigate to="/404" replace />;
  }

  const imageSection = page.content.sections?.find(
    s => s.type === "externalImage" || s.type === "internalImage"
  );
  const imageUrl = imageSection?.url ?? imageSection?.src;
  const author   = page.content.shoutout?.name ?? null;
  const authorUrl = page.content.shoutout?.url ?? null;
  const trusted  = page.trusted ?? true;

  return (
    <GuideImage
      title={page.title}
      imageUrl={imageUrl}
      author={author}
      authorUrl={authorUrl}
      trusted={trusted}
    />
  );
}
