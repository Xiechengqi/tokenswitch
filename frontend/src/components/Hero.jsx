import TerminalCard from './TerminalCard';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <h1 className="hero-headline">
            One command.<br />
            Global <span className="accent">connections</span>.
          </h1>
          <p className="hero-sub">
            Launch and share your own Claude, Codex &amp; Gemini anywhere in the world.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#install">
              Get Started
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="hero-right">
          <TerminalCard />
        </div>
      </div>
    </section>
  );
}
