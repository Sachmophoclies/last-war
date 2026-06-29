import PageTemplate from "../components/PageTemplate.jsx";
import { findPageByPath } from "../data/pages.js";

const page = findPageByPath("/about/app");

export default function AboutApp() {
  return (
    <PageTemplate
      title="About This App"
      sections={page?.content?.sections}
    />
  );
}
