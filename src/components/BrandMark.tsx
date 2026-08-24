import { cn } from "@/lib/cn";

/** TokenSwitch profile mark, stored locally rather than hotlinked from X. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/tokenswitch-logo.png"
      alt=""
      width={204}
      height={204}
      className={cn("h-7 w-7 shrink-0 rounded-full object-cover", className)}
      aria-hidden
    />
  );
}
