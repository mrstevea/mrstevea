"use client";

// FlavorForge — Main forge experience (ingredient input → AI generation → result)

import { useState } from "react";
import { Flame, Settings, Loader2, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/ingredients/IngredientInput";
import { PreferencesPanel } from "@/components/ingredients/PreferencesPanel";
import { RecipeResult } from "@/components/forge/RecipeResult";
import { useForgeStore } from "@/store/forge";
import { cn } from "@/lib/utils";

type View = "input" | "result";

export function ForgeView() {
  const [view,          setView]          = useState<View>("input");
  const [showPrefs,     setShowPrefs]     = useState(false);
  const { ingredients, generate, isGenerating, result, error } = useForgeStore();

  const handleGenerate = async () => {
    await generate();
    if (useForgeStore.getState().result) {
      setView("result");
    }
  };

  if (view === "result" && result) {
    return (
      <RecipeResult
        result={result}
        onBack={() => setView("input")}
        onReforge={handleGenerate}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forge-50 to-cream-50 px-4 py-16 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-forge-100 opacity-40 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-forge-200 bg-white px-4 py-1.5 text-sm font-medium text-forge-700 shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-forge-500" />
            Powered by Claude AI
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-900 leading-tight mb-4">
            Create Recipes.
            <br />
            <span className="text-forge-500">Cook Anything.</span>
            <br />
            Waste Nothing.
          </h1>

          <p className="max-w-lg mx-auto text-lg text-stone-500 mb-8">
            Tell FlavorForge what's in your fridge. We'll forge a recipe
            worthy of your table — tailored to your taste, diet, and skills.
          </p>
        </div>
      </section>

      {/* Forge panel */}
      <section className="max-w-2xl mx-auto px-4 py-8 -mt-6">
        <div className="rounded-3xl border border-cream-200 bg-white shadow-recipe overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-500">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-semibold text-stone-800">The Forge</span>
            </div>
            <button
              onClick={() => setShowPrefs((p) => !p)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                showPrefs
                  ? "bg-forge-100 text-forge-700"
                  : "text-stone-500 hover:bg-cream-100"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              Preferences
            </button>
          </div>

          {/* Ingredient input */}
          <div className="p-6">
            <IngredientInput />
          </div>

          {/* Preferences panel (collapsible) */}
          {showPrefs && (
            <div className="border-t border-cream-100 p-6 animate-fade-up">
              <PreferencesPanel />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Forge button */}
          <div className="px-6 pb-6">
            <Button
              size="xl"
              onClick={handleGenerate}
              disabled={isGenerating || ingredients.length === 0}
              className="w-full gap-2 text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Forging your recipe…
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5" />
                  Forge Recipe
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>

            {ingredients.length === 0 && (
              <p className="mt-2 text-center text-xs text-stone-400">
                Add at least one ingredient to get started
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { emoji: "🧠", title: "AI-Powered",       desc: "Claude generates recipes tailored to exactly what you have" },
          { emoji: "♻️",  title: "Zero Waste",       desc: "Prioritizes expiring ingredients to minimize food waste" },
          { emoji: "📋",  title: "Guided Cooking",   desc: "Step-by-step mode with timers, voice, and serving adjustments" },
        ].map((feat) => (
          <div key={feat.title} className="text-center space-y-2">
            <div className="text-4xl">{feat.emoji}</div>
            <h3 className="font-display font-semibold text-stone-900">{feat.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
