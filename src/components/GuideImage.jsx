import { useState } from "react";

export default function GuideImage({ title, imageUrl, author, authorUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Determine if imageUrl is a local asset or external URL
  const isLocalImage = imageUrl && !imageUrl.startsWith('http');
  const imageSrc = isLocalImage ? `/last-war/assets/guides/${imageUrl}` : imageUrl;

  // Check if author information is available
  const hasAuthor = author && authorUrl;
  const displayAuthor = author || "Unknown";

  // GitHub issue URL for crediting unknown authors
  const githubIssueUrl = "https://github.com/sachm/last-war/issues/new?template=guide-credit.md&title=Credit%20for%20Guide:%20" + encodeURIComponent(title);

  // If no guide data is provided, show placeholder
  if (!imageUrl) {
    return (
      <div className="page">
        <h1>{title || "Guide"}</h1>
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            This guide is coming soon. Check back later!
          </p>
        </div>
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
                Guide created by{' '}
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
              'Author unknown'
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
              Loading guide...
            </div>
          )}
          <img
            src={imageSrc}
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
          Click image to {zoomed ? 'zoom out' : 'zoom in'}
        </div>
      </div>

      <div className="card">
        <h2>{hasAuthor ? 'Support the Creator' : 'Unknown Author'}</h2>
        {hasAuthor ? (
          <>
            <p>
              If you find this guide helpful, consider supporting {author}.
            </p>
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Support {author}
            </a>
          </>
        ) : (
          <>
            <p>
              The author of this guide is unknown. If you know who created this guide and would like to give them credit, please raise an issue on GitHub.
            </p>
            <a
              href={githubIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Help Credit This Author
            </a>
          </>
        )}
      </div>
    </div>
  );
}
