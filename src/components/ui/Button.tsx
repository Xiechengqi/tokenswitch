import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

/* Playful Geometric: depth comes from a 2px ink border and a colour fill —
 * never from elevation. The tactile signal is a tiny scale that resets on
 * press, so the button feels like it takes the weight of the click. */
const base =
  "group inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium " +
  "transition-[transform,background-color,border-color,color] duration-[var(--dur-fast)] ease-out " +
  "hover:scale-[1.02] active:scale-[0.99] " +
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:hover:scale-100 " +
  "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:border-border aria-disabled:bg-muted aria-disabled:text-muted-foreground";

const variants: Record<Variant, string> = {
  primary:
    "border-2 border-border-strong bg-accent text-accent-foreground",
  secondary:
    "border-2 border-border-strong bg-card text-foreground",
  ghost:
    "border-2 border-transparent text-foreground hover:border-border hover:bg-muted active:bg-muted",
};

export function Button({
  href,
  external,
  variant = "primary",
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  href?: string;
  external?: boolean;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
