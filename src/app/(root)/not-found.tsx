import Link from "next/link";
import { getDict } from "@/lib/i18n";

const t = getDict("en");

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">{t.notFound.title}</p>
      <Link href="/" className="font-semibold text-accent hover:underline">
        {t.notFound.back}
      </Link>
    </div>
  );
}
