import { cn } from "@/lib/cn";

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
        hover && "transition-transform hover:scale-[1.01]",
        className,
      )}
    >
      {children}
    </div>
  );
}
