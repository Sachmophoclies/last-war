import aboutData from "../data/content.json";
import BackButton from "../components/BackButton.jsx";

export default function AboutApp() {
  return (
    <div className="page">
      <h1>About This App</h1>

      <div className="card">
        <p>{aboutData.app.description}</p>
      </div>

      <BackButton />
    </div>
  );
}
