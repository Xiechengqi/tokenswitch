import { cn } from "@/lib/cn";

/* Border-only depth (Playful Geometric): a soft edge on a white surface, sat
 * on cream paper. Hover lifts to accent — not ink — so interaction doesn't
 * reintroduce page-slicing black rules. */
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
          "transition-[border-color,background-color] duration-[var(--dur-base)] ease-out hover:border-accent hover:bg-accent/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
