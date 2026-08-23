import { cn } from "@/lib/cn";

type LogoProps = {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Temporary brand mark. Inline SVG keeps it crisp at any size with zero
 * network requests. Swap the paths for the final logo when assets arrive.
 */
export function Logo({ size = 56, className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id="mi-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb627" />
          <stop offset="1" stopColor="#ff8a1f" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="120" height="120" rx="30" fill="#10141f" />
      <rect
        x="4.75"
        y="4.75"
        width="118.5"
        height="118.5"
        rx="29.25"
        fill="none"
        stroke="#ffb627"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M30 34 h56 a12 12 0 0 1 12 12 v26 a12 12 0 0 1 -12 12 h-30 l-14 12 v-12 h-12 a12 12 0 0 1 -12 -12 v-26 a12 12 0 0 1 12 -12 z"
        fill="url(#mi-logo-g)"
      />
      <path
        d="M55.5 52.5 c0 -5 4 -8 8.6 -8 c5 0 8.4 3.2 8.4 7.4 c0 3.4 -1.9 5.2 -4.6 7.1 c-2.4 1.7 -3.4 3 -3.4 5.6 v1"
        fill="none"
        stroke="#10141f"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="64.5" cy="74" r="3.2" fill="#10141f" />
      <path
        d="M78 78 h22 a8 8 0 0 1 8 8 v8 a8 8 0 0 1 -8 8 h-8 l-8 7 v-7 h-6 a8 8 0 0 1 -8 -8 v-8 a8 8 0 0 1 8 -8 z"
        fill="#ff3b5c"
      />
      <circle cx="89" cy="90" r="3.2" fill="#10141f" />
    </svg>
  );
}

/** The app name as a two-tone wordmark. Copy lives in one place. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight", className)}>
      <span className="text-fg">Mallu</span>
      <span className="text-accent">Imposter</span>
    </span>
  );
}
