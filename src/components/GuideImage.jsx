import { useState } from "react";
import content from "../data/content.json";
import BackButton from "./BackButton.jsx";

export default function GuideImage({ title, imageUrl, author, authorUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Check if author information is available
  const hasAuthor = author && authorUrl;
  const displayAuthor = author || "Unknown";

  // GitHub issue URL for crediting unknown authors
  const githubIssueUrl = "https://github.com/Sachmophoclies/last-war/issues/new?template=guide-credit.md&title=Credit%20for%20Guide:%20" + encodeURIComponent(title);

  // If no guide data is provided, show placeholder
  if (!imageUrl) {
    return (
      <div className="page">
        <h1>{title || "Guide"}</h1>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            {content.guides.comingSoon}
          </p>
        </div>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{title}</h1>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {hasAuthor ? (
              <>
                {content.guides.createdBy}{' '}
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
                >
                  {author}
                </a>
              </>
            ) : (
              content.guides.authorUnknown
            )}
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            cursor: zoomed ? 'zoom-out' : 'zoom-in'
          }}
          onClick={() => setZoomed(!zoomed)}
        >
          {!imageLoaded && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {content.guides.loadingGuide}
            </div>
          )}
          <img
            src={imageUrl}
            alt={`${title} by ${displayAuthor}`}
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: 'auto',
              display: imageLoaded ? 'block' : 'none',
              borderRadius: '8px',
              transition: 'transform 0.2s ease',
              transform: zoomed ? 'scale(1.5)' : 'scale(1)',
              transformOrigin: 'top center'
            }}
          />
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {zoomed ? content.guides.clickToZoomOut : content.guides.clickToZoomIn}
        </div>
      </div>

      <div className="card">
        <h2>{hasAuthor ? content.guides.supportCreator.title : content.guides.unknownAuthor.title}</h2>
        {hasAuthor ? (
          <>
            <p>
              {content.guides.supportCreator.message} {author}.
            </p>
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              {content.guides.supportCreator.buttonText} {author}
            </a>
          </>
        ) : (
          <>
            <p>
              {content.guides.unknownAuthor.message}
            </p>
            <a
              href={githubIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              {content.guides.unknownAuthor.buttonText}
            </a>
          </>
        )}
      </div>

      <BackButton />
    </div>
  );
}
