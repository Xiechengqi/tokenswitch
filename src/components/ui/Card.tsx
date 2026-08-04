import { cn } from "@/lib/cn";

/* Border-only depth (Playful Geometric): a 2px hairline-ink edge on a white
 * surface, sat on cream paper. No shadow — if a card reads flat, the fix is
 * contrast and spacing, not elevation. */
export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-6",
        hover &&
          "transition-[border-color] duration-[var(--dur-base)] ease-out hover:border-border-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}
