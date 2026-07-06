import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/en/" className="font-semibold text-accent hover:underline">
        Back home
      </Link>
    </div>
  );
}
