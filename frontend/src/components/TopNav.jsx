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
      </div>
    </header>
  );
}
