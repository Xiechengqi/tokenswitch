import { useState, useEffect, useCallback } from 'react';
import { useMapPoints } from '../hooks/useMapPoints';

export default function StatsStrip() {
  const [counts, setCounts] = useState({ clients: 0, servers: 0, regions: 0 });
  const [pulse, setPulse] = useState(true);

  const handleUpdate = useCallback((data) => {
    setCounts({
      clients: data.clientCount || 0,
      servers: data.servers.length,
      regions: data.regions.length,
    });
  }, []);

  useMapPoints(handleUpdate);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="stats">
      <div className="stats-inner">
        <Stat label="Servers" value={counts.servers} />
        <Stat label="Regions" value={counts.regions} />
        <Stat label="Connections" value={counts.clients} />
        <div className="stat live-stat">
          <div className="stat-value">
            <span className="live-dot" style={{ opacity: pulse ? 1 : 0.45 }} />
          </div>
          <div className="stat-label">Live</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
