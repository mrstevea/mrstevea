import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meal Planner" };

export default function PlannerPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900">Meal Planner</h1>
        <p className="text-stone-500 mt-1">
          AI-generated weekly meal plans tailored to your budget and nutrition goals.
        </p>
      </div>
      <WeeklyPlanner />
    </main>
  );
}
