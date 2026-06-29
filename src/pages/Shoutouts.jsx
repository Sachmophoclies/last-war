import { findPageByPath } from "../data/pages.js";
import BackButton from "../components/BackButton.jsx";

const page = findPageByPath("/shoutouts");

export default function Shoutouts() {
  return (
    <div className="page">
      <h1>Shoutouts</h1>

      {page.shoutoutGroups.map((group, gi) => (
        <div key={gi} className="card">
          <h2>{group.title}</h2>
          {group.items.map((item, ii) => (
            <div key={ii} style={ii > 0 ? { marginTop: '24px' } : {}}>
              <h3 style={{ marginTop: '0', marginBottom: item.description ? undefined : '16px' }}>
                {item.name}
              </h3>
              {item.description && <p>{item.description}</p>}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{ display: 'inline-block', textDecoration: 'none' }}
                >
                  {item.urlText}
                </a>
              )}
            </div>
          ))}
        </div>
      ))}

      <BackButton />
    </div>
  );
}
