import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
};

/** Base surface card used across settings and info screens. */
export function Card({ children, className, padded = true, ...rest }: CardProps) {
  return (
    <div className={cn("surface-card rounded-lg", padded && "p-4 sm:p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  className,
  hint,
}: {
  children: ReactNode;
  className?: string;
  hint?: ReactNode;
}) {
  return (
    <div className={cn("mb-2.5 flex items-baseline justify-between gap-3 px-1", className)}>
      <h2 className="eyebrow text-muted">{children}</h2>
      {hint && <span className="text-xs font-medium text-faint tabular">{hint}</span>}
    </div>
  );
}
