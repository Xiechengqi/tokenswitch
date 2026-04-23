import FeatureCard from './FeatureCard';
import { ShieldIcon, GlobeIcon, BoltIcon } from './icons';

const FEATURES = [
  {
    icon: <ShieldIcon />,
    title: 'Self-hosted & private',
    desc: 'Your tokens and conversations stay on your own infrastructure. No third-party relay, no vendor lock-in.',
  },
  {
    icon: <GlobeIcon />,
    title: 'Multi-region routing',
    desc: 'Clients connect to the nearest node through a global routing mesh. Share access across teammates and regions.',
  },
  {
    icon: <BoltIcon />,
    title: 'One-line deploy',
    desc: 'A single docker run command pulls the image, starts the service, and wires up the admin console.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-inner">
        <div className="features-heading">
          <h2 className="features-title">Everything you need, in one binary</h2>
          <p className="features-sub">
            Run your own Claude, Codex and Gemini gateway — without surrendering your keys.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
