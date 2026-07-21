import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground border-2 border-border-strong hover:scale-[1.02]",
  secondary:
    "bg-card text-foreground border-2 border-border-strong hover:scale-[1.02]",
  ghost: "text-foreground hover:bg-muted border-2 border-transparent",
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
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    className,
  );

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
