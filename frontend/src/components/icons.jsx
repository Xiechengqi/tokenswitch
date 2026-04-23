export function ShieldIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.5L4 5.5v6.2c0 4.3 3.2 8.2 8 10 4.8-1.8 8-5.7 8-10V5.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12l2.2 2.2L15.8 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3c2.3 2.8 3.5 5.8 3.5 9s-1.2 6.2-3.5 9c-2.3-2.8-3.5-5.8-3.5-9s1.2-6.2 3.5-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BoltIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M13 3L4.5 13.5H11l-1 7.5L18.5 10H12L13 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
