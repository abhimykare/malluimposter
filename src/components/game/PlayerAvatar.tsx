import { cn } from "@/lib/cn";

/** Distinct, pleasant hues cycled by seat index. */
const HUES = [28, 200, 140, 320, 260, 40, 180, 0, 100, 220, 290, 160];

export function playerHue(index: number): number {
  return HUES[index % HUES.length];
}

type PlayerAvatarProps = {
  index: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "imposter" | "muted";
};

const SIZES = {
  sm: "size-9 text-sm",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

/** Numbered circular avatar; colour is derived from the seat index. */
export function PlayerAvatar({ index, size = "md", className, variant = "default" }: PlayerAvatarProps) {
  const hue = playerHue(index);
  const style =
    variant === "imposter"
      ? undefined
      : variant === "muted"
        ? { background: `hsl(${hue} 30% 50% / 0.18)`, color: `hsl(${hue} 60% 72%)` }
        : {
            background: `linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${hue + 25} 80% 50%))`,
            color: "#0a0d14",
          };
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold tabular shadow-sm",
        SIZES[size],
        variant === "imposter" &&
          "bg-[linear-gradient(135deg,var(--imposter),var(--imposter-strong))] text-on-imposter shadow-glow-imposter",
        className,
      )}
    >
      {index + 1}
    </span>
  );
}
