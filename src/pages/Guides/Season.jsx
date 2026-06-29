import { useParams, Navigate } from "react-router-dom";
import PageTemplate from "../../components/PageTemplate.jsx";
import { findPageByPath } from "../../data/pages.js";

export default function Season() {
  const { seasonNumber } = useParams();
  const page = findPageByPath(`/guides/seasons/${seasonNumber}`);

  if (!page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <PageTemplate
      title={page.title}
      sections={page.content?.sections}
      shoutout={page.content?.shoutout}
    />
  );
}
