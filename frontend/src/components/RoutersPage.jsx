import { useState, useCallback } from 'react';
import { useMapPoints } from '../hooks/useMapPoints';
import RouterCard from './RouterCard';

export default function RoutersPage() {
  const [data, setData] = useState({ regions: [], servers: [] });

  const handleUpdate = useCallback(
    (d) => setData({ regions: d.regions, servers: d.servers }),
    [],
  );
  useMapPoints(handleUpdate);

  const serverByRegion = {};
  for (const s of data.servers) serverByRegion[s.region] = s;

  return (
    <section className="routers-page">
      <div className="routers-inner">
        <div className="routers-heading">
          <h1 className="routers-title">Routers</h1>
          <p className="routers-sub">
            Global edge nodes where cc-switch tunnels connect and expose shared agents.
          </p>
        </div>

        {data.regions.length === 0 ? (
          <p className="routers-empty">Loading routers…</p>
        ) : (
          <div className="routers-grid">
            {data.regions.map((r) => {
              const s = serverByRegion[r.region];
              return (
                <RouterCard
                  key={r.region}
                  region={r.region}
                  url={r.url}
                  lat={s?.lat}
                  lon={s?.lon}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
