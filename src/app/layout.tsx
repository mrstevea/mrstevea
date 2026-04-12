import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-playfair",
  weight:   ["400", "600", "700", "800"],
  display:  "swap",
});

export const metadata: Metadata = {
  title:       { default: "FlavorForge", template: "%s | FlavorForge" },
  description: "Create Recipes. Cook Anything. Waste Nothing. AI-powered recipe generation from your available ingredients.",
  keywords:    ["recipe generator", "AI cooking", "meal planner", "food waste", "ingredient-based recipes"],
  openGraph: {
    type:        "website",
    title:       "FlavorForge",
    description: "Create Recipes. Cook Anything. Waste Nothing.",
    siteName:    "FlavorForge",
  },
};

export const viewport: Viewport = {
  width:              "device-width",
  initialScale:       1,
  themeColor:         "#f97316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Navbar />
        {/* pt-16 on desktop to clear fixed navbar, pb-16 on mobile for tab bar */}
        <div className="min-h-screen md:pt-16 pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
