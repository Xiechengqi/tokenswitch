function formatCoords(lat, lon) {
  if (lat == null || lon == null) return null;
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

function stripScheme(url) {
  if (!url) return null;
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export default function RouterCard({ region, url, lat, lon }) {
  const label = region.charAt(0).toUpperCase() + region.slice(1);
  const coords = formatCoords(lat, lon);
  const domain = stripScheme(url);

  return (
    <a
      className="router-card"
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="router-card-top">
        <span className="router-card-live">
          <span className="live-dot" />
          <span>Live</span>
        </span>
        <svg
          className="router-card-arrow"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 11L11 5M11 5H6.5M11 5V9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="router-card-region">{label}</h3>
      {coords && <p className="router-card-coords">{coords}</p>}
      {domain && <p className="router-card-url">{domain}</p>}
    </a>
  );
}
