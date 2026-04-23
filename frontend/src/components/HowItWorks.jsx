import { useRef, useEffect } from 'react';

const CYCLE = 6000;
const P_REQ = [2000, 3000];
const P_ROUTE = [3000, 4000];
const P_BACK = [4000, 5500];

export default function HowItWorks() {
  const tunnelRef = useRef(null);
  const reqRef = useRef(null);
  const backRef = useRef(null);
  const dotReq = useRef(null);
  const dotRoute = useRef(null);
  const dotBack = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = performance.now();
    let raf;

    const setDot = (el, path, p, reverse = false) => {
      if (!el || !path) return;
      const len = path.getTotalLength();
      const t = reverse ? 1 - p : p;
      const pt = path.getPointAtLength(t * len);
      el.setAttribute('cx', pt.x);
      el.setAttribute('cy', pt.y);
      el.setAttribute('opacity', '1');
    };

    const hide = (el) => el && el.setAttribute('opacity', '0');

    const loop = (now) => {
      const t = (now - start) % CYCLE;

      if (t >= P_REQ[0] && t < P_REQ[1]) {
        setDot(dotReq.current, reqRef.current, (t - P_REQ[0]) / (P_REQ[1] - P_REQ[0]));
      } else {
        hide(dotReq.current);
      }

      if (t >= P_ROUTE[0] && t < P_ROUTE[1]) {
        setDot(dotRoute.current, tunnelRef.current, (t - P_ROUTE[0]) / (P_ROUTE[1] - P_ROUTE[0]), true);
      } else {
        hide(dotRoute.current);
      }

      if (t >= P_BACK[0] && t < P_BACK[1]) {
        setDot(dotBack.current, backRef.current, (t - P_BACK[0]) / (P_BACK[1] - P_BACK[0]));
      } else {
        hide(dotBack.current);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="how" id="how-it-works">
      <div className="how-inner">
        <div className="how-heading">
          <h2 className="how-title">How it works</h2>
          <p className="how-sub">
            Share your code agent with the world through a self-hosted tunnel — no servers to manage, no tokens to copy.
          </p>
        </div>

        <div className="how-diagram-wrap">
          <svg
            className="how-diagram"
            viewBox="0 0 1000 300"
            role="img"
            aria-label="token-switch architecture: cc-switch connects to the router via SSH; consumers reach the router over HTTPS; the router proxies traffic through the tunnel back to the sharer"
          >
            <path ref={reqRef} className="how-path how-path-req" d="M 760 140 Q 495 55 410 140" />
            <path ref={backRef} className="how-path how-path-back" d="M 230 160 Q 495 245 760 160" />
            <path ref={tunnelRef} className="how-path how-path-tunnel" d="M 230 150 L 410 150" />

            <text className="how-label" x="320" y="138">SSH tunnel</text>
            <text className="how-label how-label-req" x="540" y="82">HTTPS request</text>
            <text className="how-label how-label-back" x="495" y="222">Response</text>

            <Node x={50} label="cc-switch" caption="your machine">
              <rect x="-20" y="-14" width="40" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="-26" y="10" width="52" height="3" rx="1" fill="currentColor" />
              <path d="M 1 -10 L -6 1 L 0 1 L -4 9 L 7 -3 L 0 -3 Z" fill="#7C3AED" />
            </Node>

            <Node x={400} label="router" caption="global edge">
              <circle cx="0" cy="0" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="7" ry="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M -16 0 L 16 0" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="2.5" fill="#7C3AED" />
            </Node>

            <Node x={750} label="consumer" caption="anywhere">
              <circle cx="0" cy="-6" r="6" fill="currentColor" />
              <path d="M -11 12 Q -11 0 0 0 Q 11 0 11 12 Z" fill="currentColor" />
            </Node>

            <circle ref={dotReq} r="6" className="how-dot how-dot-req" opacity="0" />
            <circle ref={dotRoute} r="6" className="how-dot how-dot-route" opacity="0" />
            <circle ref={dotBack} r="6" className="how-dot how-dot-back" opacity="0" />
          </svg>
        </div>

        <ol className="how-steps">
          <li className="how-step">
            <span className="how-step-num">1</span>
            <p>
              <b>Share.</b> Run cc-switch and open an outbound SSH tunnel to the nearest router.
            </p>
          </li>
          <li className="how-step">
            <span className="how-step-num">2</span>
            <p>
              <b>Route.</b> Public requests hit a subdomain on the router and are proxied back through the tunnel.
            </p>
          </li>
          <li className="how-step">
            <span className="how-step-num">3</span>
            <p>
              <b>Serve.</b> Your local agent answers; the response returns along the same path — keys never leave your machine.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Node({ x, label, caption, children }) {
  return (
    <g transform={`translate(${x}, 90)`} className="how-node">
      <rect width="180" height="120" rx="16" className="how-node-bg" />
      <g transform="translate(90, 42)" className="how-node-icon">{children}</g>
      <text x="90" y="85" textAnchor="middle" className="how-node-label">{label}</text>
      <text x="90" y="102" textAnchor="middle" className="how-node-caption">{caption}</text>
    </g>
  );
}
