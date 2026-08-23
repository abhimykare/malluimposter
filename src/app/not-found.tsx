import Link from "next/link";

import { Logo } from "@/components/brand/Logo";

/** Static, language-neutral 404 (server component — no client state needed). */
export default function NotFound() {
  return (
    <main className="bg-ambient flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo size={64} />
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-fg">Page not found</h1>
      <p className="mt-2 max-w-[32ch] text-muted text-balance">
        That page doesn&apos;t exist. The game, however, is right here.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-6 font-semibold text-on-accent shadow-glow-accent"
      >
        Back to home
      </Link>
    </main>
  );
}
