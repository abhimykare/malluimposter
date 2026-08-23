import type { ReactNode } from "react";

import { MotionProvider } from "@/components/layout/MotionProvider";

/**
 * The interactive game routes get the animation feature bundle. The home
 * route stays outside this group so it ships no animation JavaScript at all.
 */
export default function PlayLayout({ children }: { children: ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
