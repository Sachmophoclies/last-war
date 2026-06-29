import { useState } from "react";
import BackButton from "./BackButton.jsx";

function ImageSection({ src, alt }) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "8px" }}>
        {zoomed ? "Click image to zoom out" : "Click image to zoom in"}
      </p>
      <img
        src={src}
        alt={alt}
        onClick={() => setZoomed(z => !z)}
        style={{
          width: zoomed ? "100%" : "120px",
          cursor: "pointer",
          transition: "width 0.3s ease",
          borderRadius: "8px"
        }}
      />
    </div>
  );
}

function ShoutoutSection({ shoutout }) {
  return (
    <div className="card">
      <h2>Support the Creator</h2>
      {shoutout.description && <p>{shoutout.description}</p>}
      <p>
        {shoutout.url
          ? <>If you find this helpful, consider supporting <strong>{shoutout.name}</strong>.</>
          : <strong>{shoutout.name}</strong>
        }
      </p>
      {shoutout.url && (
        <a href={shoutout.url} target="_blank" rel="noreferrer">
          <button className="btn">{shoutout.urlText ?? "Support"}</button>
        </a>
      )}
    </div>
  );
}

export default function PageTemplate({ title, sections, shoutout, showBack = true }) {
  return (
    <div className="page">
      {title && <h1>{title}</h1>}

      {sections?.map((section, i) => {
        if (section.type === "text") {
          return (
            <div key={i} className="card">
              <p>{section.body}</p>
            </div>
          );
        }
        if (section.type === "externalImage") {
          return <ImageSection key={i} src={section.url} alt={section.alt} />;
        }
        if (section.type === "internalImage") {
          return <ImageSection key={i} src={section.src} alt={section.alt} />;
        }
        return null;
      })}

      {shoutout && <ShoutoutSection shoutout={shoutout} />}

      {showBack && <BackButton />}
    </div>
  );
}
