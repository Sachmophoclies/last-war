import content from "../data/content.json";
import BackButton from "../components/BackButton.jsx";

export default function Shoutouts() {
  return (
    <div className="page">
      <h1>{content.shoutouts.title}</h1>

      <div className="card">
        <h2>{content.shoutouts.friendsAndCommunity.title}</h2>

        <div>
          <h3 style={{ marginTop: '0' }}>{content.shoutouts.friendsAndCommunity.djNyx.name}</h3>
          <p>
            {content.shoutouts.friendsAndCommunity.djNyx.description}
          </p>
          <a
            href={content.shoutouts.friendsAndCommunity.djNyx.url}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            {content.shoutouts.friendsAndCommunity.djNyx.buttonText}
          </a>
        </div>
      </div>

      <div className="card">
        <h2>{content.shoutouts.rss.title}</h2>
        <div>
          <h3 style={{ marginTop: '0', marginBottom: '16px' }}>{content.shoutouts.rss.aethernis.name}</h3>
          <a
            href={content.shoutouts.rss.aethernis.url}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            {content.shoutouts.rss.aethernis.buttonText}
          </a>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginTop: '0', marginBottom: '16px' }}>{content.shoutouts.rss.mono.name}</h3>
          <a
            href={content.shoutouts.rss.mono.url}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            {content.shoutouts.rss.mono.buttonText}
          </a>
        </div>
      </div>

      <BackButton />
    </div>
  );
}
