import { Github } from "lucide-react";
import { GITHUB_REPO, TELEGRAM_URL, X_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";

const iconBtn =
  "inline-flex rounded-full bg-muted/50 p-2 text-foreground transition-colors hover:bg-muted";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SocialIconLinks({
  labels,
  className,
  showGithub = true,
}: {
  labels: { telegram: string; x: string; github: string };
  className?: string;
  showGithub?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={TELEGRAM_URL}
        className={iconBtn}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.telegram}
      >
        <TelegramIcon className="h-4 w-4" />
      </a>
      <a href={X_URL} className={iconBtn} target="_blank" rel="noopener noreferrer" aria-label={labels.x}>
        <XIcon className="h-4 w-4" />
      </a>
      {showGithub && (
        <a
          href={GITHUB_REPO}
          className={iconBtn}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.github}
        >
          <Github className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export function SocialTextLinks({
  labels,
  className,
}: {
  labels: { telegram: string; x: string };
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
      <a
        href={TELEGRAM_URL}
        className="text-muted-foreground hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {labels.telegram}
      </a>
      <a
        href={X_URL}
        className="text-muted-foreground hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
      >
        {labels.x}
      </a>
    </p>
  );
}
