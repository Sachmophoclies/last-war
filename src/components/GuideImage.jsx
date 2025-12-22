import { useState } from "react";
import content from "../data/content.json";
import BackButton from "./BackButton.jsx";

export default function GuideImage({ title, imageUrl, author, authorUrl, trusted = true }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Determine author information state
  const hasAuthor = !!author;
  const hasAuthorUrl = !!authorUrl;
  const hasFullAttribution = hasAuthor && hasAuthorUrl;
  const displayAuthor = author || "Unknown";

  // GitHub issue URL for crediting unknown authors or reporting incorrect attribution
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
            {hasFullAttribution ? (
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
                {!trusted && ' (Community Credited)'}
              </>
            ) : hasAuthor ? (
              <>
                {content.guides.createdBy} {author}
                {!trusted && ' (Community Credited)'}
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
        <h2>
          {hasFullAttribution
            ? content.guides.supportCreator.title
            : hasAuthor
            ? "About This Guide"
            : content.guides.unknownAuthor.title}
        </h2>

        {hasFullAttribution ? (
          <>
            <p>
              {content.guides.supportCreator.message} {author}.
            </p>
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none', marginRight: '8px' }}
            >
              {content.guides.supportCreator.buttonText} {author}
            </a>
            {!trusted && (
              <a
                href={githubIssueUrl}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--text-muted)', marginTop: '8px' }}
              >
                Report Incorrect Attribution
              </a>
            )}
          </>
        ) : hasAuthor ? (
          <>
            <p>
              This guide is attributed to {author}, but no support link is available.
              {!trusted && " This attribution was provided by the community."}
            </p>
            <a
              href={githubIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              {!trusted ? "Report Incorrect Attribution" : "Add Support Link"}
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
