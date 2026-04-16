import { useState, useEffect, useRef } from 'react';

export default function StatusCard({ clientCount, serverCount, regions }) {
  const [pulse, setPulse] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  return (
    <div className="status-card">
      <div className="status-live">
        <span
          className="status-dot"
          style={{ opacity: pulse ? 1 : 0.4 }}
        />
        <span className="status-label">Live</span>
      </div>
      <div className="status-count">
        {clientCount} <span className="status-unit">connections</span>
      </div>
      <div className="status-secondary">
        {serverCount} {serverCount === 1 ? 'router' : 'routers'}
      </div>

      {regions.length > 0 && (
        <div className="status-dropdown" ref={dropdownRef}>
          <button
            className="status-dropdown-trigger"
            onClick={() => setOpen(o => !o)}
          >
            Routers
            <span className={`status-dropdown-arrow ${open ? 'open' : ''}`}>&#9662;</span>
          </button>
          {open && (
            <div className="status-dropdown-menu">
              {regions.map((r) => (
                <a
                  key={r.region}
                  className="status-dropdown-item"
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.region}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
