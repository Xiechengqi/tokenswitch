import { cn } from "@/lib/cn";

/** TokenSwitch TS/$ monogram — matches public/favicon.svg */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn("h-7 w-7 shrink-0 text-accent", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 8.25h15M16 8.25v15.5"
      />
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.4 12c0-2.15-2.4-3.55-5.4-3.55S10.6 9.85 10.6 12c0 2.15 2 3.2 5.4 4.05 3.4.85 5.4 2.05 5.4 4.25 0 2.25-2.4 3.7-5.4 3.7S10.6 22.55 10.6 20.3"
      />
    </svg>
  );
}
