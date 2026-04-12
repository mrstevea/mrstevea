import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format minutes to human-readable string
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Compute urgency score from days remaining
export function computeUrgencyScore(daysLeft: number): number {
  if (daysLeft <= 0)  return 100;
  if (daysLeft <= 1)  return 90;
  if (daysLeft <= 2)  return 75;
  if (daysLeft <= 3)  return 60;
  if (daysLeft <= 5)  return 40;
  if (daysLeft <= 7)  return 20;
  return 5;
}

// Urgency level label
export function urgencyLabel(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 90) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

// Days until expiration
export function daysUntilExpiry(expiresAt: string | Date): number {
  const now     = new Date();
  const expDate = new Date(expiresAt);
  const diff    = expDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Generate recipe share slug
export function generateShareSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Nutrition display helper
export function formatNutrition(value: number, unit: string = "g"): string {
  return `${Math.round(value)}${unit}`;
}

// Scale ingredient quantities for different serving sizes
export function scaleQuantity(
  quantity: number | null,
  originalServings: number,
  targetServings: number
): number | null {
  if (quantity === null) return null;
  return Math.round((quantity * targetServings / originalServings) * 100) / 100;
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format dietary restriction display
export function formatDietary(tag: string): string {
  return tag
    .split("_")
    .map(capitalize)
    .join("-");
}

// Get meal type emoji
export function mealTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    BREAKFAST: "☀️",
    LUNCH:     "🌤️",
    DINNER:    "🌙",
    SNACK:     "🍎",
    DESSERT:   "🍰",
    DRINK:     "🥤",
  };
  return map[type] ?? "🍽️";
}

// Day name from index (0 = Monday)
export function dayName(dayOfWeek: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[dayOfWeek] ?? "Unknown";
}

// Convert file to base64 for image upload
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
