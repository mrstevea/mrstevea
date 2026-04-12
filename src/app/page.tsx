// FlavorForge — Home + Forge page
// Landing + ingredient input + AI generation result

import { ForgeView } from "@/components/forge/ForgeView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlavorForge — Create Recipes. Cook Anything. Waste Nothing.",
};

export default function HomePage() {
  return <ForgeView />;
}
