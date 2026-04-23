import { navigate, navigateAnchor } from '../hooks/usePath';

function onHome(e) {
  e.preventDefault();
  navigate('/');
}

function onRouters(e) {
  e.preventDefault();
  navigate('/routers');
}

function onAnchor(e, hash) {
  e.preventDefault();
  navigateAnchor(hash);
}

export default function TopNav() {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <a className="topnav-brand" href="/" onClick={onHome}>
          <img className="brand-mark" src="/favicon.svg" alt="" width="22" height="22" />
          <span className="brand-text">token-switch</span>
        </a>
        <nav className="topnav-links">
          <a href="/#features" onClick={(e) => onAnchor(e, 'features')}>Features</a>
          <a href="/#how-it-works" onClick={(e) => onAnchor(e, 'how-it-works')}>How it works</a>
          <a href="/routers" onClick={onRouters}>Router</a>
          <a href="#">Docs</a>
        </nav>
        <div className="topnav-actions">
          <button className="topnav-search" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <a
            className="btn btn-primary btn-sm"
            href="/#install"
            onClick={(e) => onAnchor(e, 'install')}
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
