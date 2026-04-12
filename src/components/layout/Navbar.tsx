"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, CalendarDays, BookmarkCheck, User, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",        label: "Forge",   icon: Flame        },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/saved",   label: "Saved",   icon: BookmarkCheck },
  { href: "/profile", label: "Profile", icon: User          },
];

export function Navbar() {
  const pathname = usePathname();

  // Hide navbar in cooking mode
  if (pathname.startsWith("/cook/")) return null;

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 items-center border-b border-cream-200 bg-white/80 backdrop-blur-md px-6">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-500">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-stone-900">FlavorForge</span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-forge-100 text-forge-700"
                  : "text-stone-600 hover:bg-cream-100 hover:text-stone-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t border-cream-200 bg-white/95 backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-forge-600" : "text-stone-400"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                active ? "text-forge-600" : "text-stone-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
