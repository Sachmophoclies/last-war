export default function Shoutouts() {
  return (
    <div className="page">
      <h1>Shoutouts</h1>

      <div className="card">
        <h2>Friends & Community</h2>

        <div>
          <h3 style={{ marginTop: '0' }}>DJ Nyx</h3>
          <p>
            Alliance member who holds awesome DJ sets on Twitch. Check out the streams!
          </p>
          <a
            href="https://www.twitch.tv/n_y_x_official"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            Visit DJ Nyx on Twitch
          </a>
        </div>
      </div>
    </div>
  );
}
