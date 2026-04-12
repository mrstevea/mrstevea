"use client";

// FlavorForge — Weekly meal planner grid

import { useState } from "react";
import Link from "next/link";
import { Clock, ChevronDown, ChevronUp, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, dayName, mealTypeEmoji, formatTime } from "@/lib/utils";

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"] as const;

interface PlanMeal {
  dayOfWeek:         number;
  mealType:          string;
  title:             string;
  description:       string;
  cookTime:          number;
  servings:          number;
  estimatedCost:     number;
  estimatedCalories: number;
  keyIngredients:    string[];
  quickInstructions: string;
}

interface ShoppingItem {
  name:          string;
  quantity:      number;
  unit:          string;
  category:      string;
  estimatedCost: number;
}

interface WeekSummary {
  totalEstimatedCost:  number;
  avgDailyCalories:    number;
  cuisinesIncluded:    string[];
  wasteMinimizationTips: string[];
}

interface PlanData {
  meals:        PlanMeal[];
  shoppingList: ShoppingItem[];
  weekSummary:  WeekSummary;
}

export function WeeklyPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan,         setPlan]         = useState<PlanData | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [showShopping, setShowShopping] = useState(false);

  // Preferences
  const [budget,       setBudget]       = useState<number | "">("");
  const [calories,     setCalories]     = useState<number | "">("");
  const [maxCookTime,  setMaxCookTime]  = useState<number | "">("");
  const [servings,     setServings]     = useState(2);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const weekStart = getMonday(new Date()).toISOString().split("T")[0];

    try {
      const res = await fetch("/api/planner", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          weekStart,
          preferences: {
            budget:        budget || undefined,
            calorieTarget: calories || undefined,
            maxCookTime:   maxCookTime || undefined,
            servings,
          },
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const getMeal = (day: number, mealType: string) =>
    plan?.meals.find((m) => m.dayOfWeek === day && m.mealType === mealType);

  return (
    <div className="space-y-8">
      {/* Config panel */}
      <div className="rounded-2xl border border-cream-200 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
          Meal Plan Settings
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Weekly Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="e.g. 100"
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Daily Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 2000"
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Max Cook Time (min)</label>
            <input
              type="number"
              value={maxCookTime}
              onChange={(e) => setMaxCookTime(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="e.g. 45"
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">Servings</label>
            <select
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value))}
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-400"
            >
              {[1, 2, 3, 4, 6, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mt-4 gap-2"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating Plan…</>
          ) : (
            "Generate My Week"
          )}
        </Button>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* Plan grid */}
      {plan && (
        <div className="space-y-6 animate-fade-up">
          {/* Week summary */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard
              label="Est. Weekly Cost"
              value={`$${plan.weekSummary.totalEstimatedCost.toFixed(0)}`}
              emoji="💰"
            />
            <SummaryCard
              label="Avg Daily Calories"
              value={`${plan.weekSummary.avgDailyCalories} kcal`}
              emoji="🔥"
            />
            <SummaryCard
              label="Cuisines"
              value={plan.weekSummary.cuisinesIncluded.slice(0, 3).join(", ")}
              emoji="🌍"
            />
          </div>

          {/* Grid — desktop table, mobile stacked */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-400 uppercase tracking-wider w-24">
                    Day
                  </th>
                  {MEAL_TYPES.map((mt) => (
                    <th key={mt} className="py-3 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider text-center">
                      {mealTypeEmoji(mt)} {mt.charAt(0) + mt.slice(1).toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-t border-cream-100">
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-stone-700">{dayName(day)}</span>
                    </td>
                    {MEAL_TYPES.map((mt) => {
                      const meal = getMeal(day, mt);
                      return (
                        <td key={mt} className="py-2 px-2">
                          {meal ? (
                            <MealCell meal={meal} />
                          ) : (
                            <div className="h-20 rounded-xl border-2 border-dashed border-cream-200 flex items-center justify-center text-xs text-stone-400">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked days */}
          <div className="md:hidden space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="rounded-2xl border border-cream-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-cream-50 font-semibold text-stone-700 text-sm">
                  {dayName(day)}
                </div>
                <div className="divide-y divide-cream-100">
                  {MEAL_TYPES.map((mt) => {
                    const meal = getMeal(day, mt);
                    return meal ? (
                      <div key={mt} className="p-3">
                        <div className="text-xs text-stone-400 mb-1">{mealTypeEmoji(mt)} {mt.charAt(0) + mt.slice(1).toLowerCase()}</div>
                        <p className="text-sm font-medium text-stone-800">{meal.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                          <span><Clock className="inline h-3 w-3 mr-0.5" />{formatTime(meal.cookTime)}</span>
                          <span>{meal.estimatedCalories} kcal</span>
                          <span>${meal.estimatedCost.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Shopping list toggle */}
          <div className="rounded-2xl border border-cream-200 bg-white shadow-card overflow-hidden">
            <button
              onClick={() => setShowShopping((p) => !p)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-forge-500" />
                <span className="font-semibold text-stone-900">
                  Shopping List ({plan.shoppingList.length} items)
                </span>
              </div>
              {showShopping ? (
                <ChevronUp className="h-4 w-4 text-stone-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-stone-400" />
              )}
            </button>

            {showShopping && (
              <div className="px-6 pb-6">
                <div className="space-y-1">
                  {plan.shoppingList.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded accent-forge-500" />
                        <span className="text-sm text-stone-800 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-400">
                        <span>{item.quantity} {item.unit}</span>
                        <span className="font-medium text-stone-600">${item.estimatedCost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-stone-700">
                    Total: ${plan.shoppingList.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
                  </span>
                  <Button size="sm" variant="outline">Export List</Button>
                </div>
              </div>
            )}
          </div>

          {/* Waste tips */}
          {plan.weekSummary.wasteMinimizationTips.length > 0 && (
            <div className="rounded-2xl border border-leaf-200 bg-leaf-50 p-4">
              <h3 className="font-semibold text-leaf-800 mb-2 text-sm">
                Zero-Waste Tips
              </h3>
              <ul className="space-y-1">
                {plan.weekSummary.wasteMinimizationTips.map((tip, i) => (
                  <li key={i} className="text-xs text-leaf-700 flex gap-2">
                    <span className="text-leaf-500">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealCell({ meal }: { meal: PlanMeal }) {
  return (
    <div className="rounded-xl bg-cream-50 border border-cream-200 p-2.5 h-20 flex flex-col justify-between group hover:bg-forge-50 hover:border-forge-200 transition-colors cursor-pointer">
      <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-tight group-hover:text-forge-700">
        {meal.title}
      </p>
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Clock className="h-3 w-3" />
        <span>{formatTime(meal.cookTime)}</span>
        <span className="ml-auto">{meal.estimatedCalories} cal</span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-4 text-center shadow-card">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-bold text-stone-900 text-sm">{value}</div>
      <div className="text-xs text-stone-400 mt-0.5">{label}</div>
    </div>
  );
}

function getMonday(date: Date): Date {
  const d   = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
