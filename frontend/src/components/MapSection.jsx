import WorldMap from './WorldMap';

export default function MapSection() {
  return (
    <section className="map-section" id="network">
      <div className="map-section-inner">
        <div className="map-section-heading">
          <h2 className="map-section-title">Live global network</h2>
          <p className="map-section-sub">
            Real-time view of clients connecting to your token-switch nodes.
          </p>
        </div>
        <div className="map-section-frame">
          <WorldMap />
        </div>
      </div>
    </section>
  );
}
