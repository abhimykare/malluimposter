import type { Metadata } from "next";

import { HowToPlayScreen } from "@/components/home/HowToPlayScreen";

export const metadata: Metadata = {
  title: "How to Play",
};

export default function HowToPlayPage() {
  return <HowToPlayScreen />;
}
