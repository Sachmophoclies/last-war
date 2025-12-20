import { useState } from "react";

export default function GuideImage({ title, imageUrl, author, authorUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // If no guide data is provided, show placeholder
  if (!imageUrl || !author) {
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
            Guide created by{' '}
            <a
              href={authorUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
            >
              {author}
            </a>
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
            src={imageUrl}
            alt={`${title} by ${author}`}
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
        <h2>Support the Creator</h2>
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
          Support {author} on Ko-fi
        </a>
      </div>
    </div>
  );
}
