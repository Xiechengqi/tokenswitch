import { useState, useEffect } from 'react';

const NAV_EVENT = 'ts:navigate';

export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    window.addEventListener(NAV_EVENT, handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener(NAV_EVENT, handler);
    };
  }, []);
  return path;
}

export function navigate(to, { scrollToTop = true } = {}) {
  if (window.location.pathname === to) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event(NAV_EVENT));
  if (scrollToTop) window.scrollTo(0, 0);
}

export function navigateAnchor(hash) {
  const goingHome = window.location.pathname !== '/';
  if (goingHome) {
    window.history.pushState({}, '', `/#${hash}`);
    window.dispatchEvent(new Event(NAV_EVENT));
  } else {
    window.history.replaceState({}, '', `/#${hash}`);
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: goingHome ? 'auto' : 'smooth' });
    });
  });
}
