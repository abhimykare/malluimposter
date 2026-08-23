import type { Metadata } from "next";

import { GameFlow } from "@/components/game/GameFlow";

export const metadata: Metadata = {
  title: "Play",
  robots: { index: false },
};

export default function GamePage() {
  return <GameFlow />;
}
