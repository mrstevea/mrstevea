"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Users, ChefHat, Bookmark, Share2, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDietary, scaleQuantity } from "@/lib/utils";
import type { Recipe } from "@/types";

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [servingScale, setServingScale] = useState(1);
  const [saved,        setSaved]        = useState(false);
  const [copied,       setCopied]       = useState(false);

  const adjustedServings = recipe.servings * servingScale;

  const handleSave = async () => {
    setSaved((prev) => !prev);
    await fetch(`/api/recipes/${recipe.id}/save`, { method: "POST" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {recipe.isAiGenerated && (
            <Badge variant="default">AI Forged</Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">{recipe.cuisine}</Badge>
          )}
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="leaf">{formatDietary(tag)}</Badge>
          ))}
        </div>

        <h1 className="font-display text-4xl font-bold text-stone-900 leading-tight">
          {recipe.title}
        </h1>

        <p className="text-lg text-stone-600 leading-relaxed">{recipe.description}</p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-y border-cream-200">
          <Stat icon={<Clock className="h-4 w-4" />} label="Prep" value={formatTime(recipe.prepTime)} />
          <Stat icon={<Clock className="h-4 w-4" />} label="Cook" value={formatTime(recipe.cookTime)} />
          <Stat icon={<Clock className="h-4 w-4" />} label="Total" value={formatTime(recipe.totalTime)} />
          <Stat icon={<Users className="h-4 w-4" />} label="Serves" value={String(adjustedServings)} />
          <Stat icon={<ChefHat className="h-4 w-4" />} label="Level" value={recipe.skillLevel} />
          {recipe.ratingAvg > 0 && (
            <Stat icon={<Star className="h-4 w-4 fill-forge-400 text-forge-400" />} label="Rating" value={`${recipe.ratingAvg.toFixed(1)} (${recipe.ratingCount})`} />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link href={`/cook/${recipe.id}`}>
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4" /> Cook Now
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={handleSave} className="gap-2">
            <Bookmark className={saved ? "h-4 w-4 fill-forge-500 text-forge-500" : "h-4 w-4"} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
      </div>

      {/* Serving adjuster */}
      <div className="flex items-center gap-4 rounded-2xl bg-cream-50 p-4">
        <span className="text-sm font-medium text-stone-700">Adjust servings:</span>
        <div className="flex items-center gap-2">
          {[0.5, 1, 1.5, 2, 3].map((m) => (
            <button
              key={m}
              onClick={() => setServingScale(m)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                servingScale === m
                  ? "bg-forge-500 text-white"
                  : "bg-white text-stone-600 hover:bg-cream-100 border border-cream-200"
              }`}
            >
              {m === 1 ? "1x" : `${m}x`}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-stone-500">
          = {adjustedServings} servings
        </span>
      </div>

      {/* Nutrition */}
      {recipe.nutrition && (
        <section>
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
            Nutrition per serving (estimate)
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Calories", value: recipe.nutrition.calories, unit: "kcal" },
              { label: "Protein",  value: recipe.nutrition.protein,  unit: "g" },
              { label: "Carbs",    value: recipe.nutrition.carbs,    unit: "g" },
              { label: "Fat",      value: recipe.nutrition.fat,      unit: "g" },
              { label: "Fiber",    value: recipe.nutrition.fiber,    unit: "g" },
            ].map((n) => (
              <div key={n.label} className="text-center rounded-2xl bg-cream-50 p-3">
                <div className="text-2xl font-bold text-forge-600">
                  {Math.round(n.value * servingScale)}
                </div>
                <div className="text-xs text-stone-500 font-medium">{n.unit}</div>
                <div className="text-xs text-stone-400">{n.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">
          Ingredients
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={i}
              className="flex items-baseline gap-3 rounded-xl px-4 py-2.5 even:bg-cream-50"
            >
              <span className="w-24 text-sm font-bold text-forge-700 shrink-0">
                {scaleQuantity(ing.quantity, 1, servingScale) !== null
                  ? `${scaleQuantity(ing.quantity, 1, servingScale)} ${ing.unit ?? ""}`.trim()
                  : "to taste"
                }
              </span>
              <span className="text-sm text-stone-800 font-medium">{ing.name}</span>
              {ing.notes && (
                <span className="text-xs text-stone-400 italic">{ing.notes}</span>
              )}
              {ing.optional && (
                <span className="ml-auto text-xs text-stone-400 italic">optional</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Equipment */}
      {recipe.equipment.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold text-stone-900 mb-3">
            Equipment Needed
          </h2>
          <div className="flex flex-wrap gap-2">
            {recipe.equipment.map((eq) => (
              <Badge key={eq} variant="outline" className="capitalize">
                {eq.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Instructions */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">
          Instructions
        </h2>
        <div className="space-y-4">
          {recipe.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="flex gap-4 rounded-2xl border border-cream-200 bg-white p-4 shadow-card"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forge-500 text-sm font-bold text-white">
                {step.stepNumber}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-relaxed text-stone-800">{step.instruction}</p>
                {step.duration && (
                  <span className="inline-flex items-center gap-1 text-xs text-forge-600 font-medium">
                    <Clock className="h-3 w-3" />
                    {step.timerLabel ?? `${step.duration} min`}
                  </span>
                )}
                {step.tips && (
                  <p className="text-xs text-stone-500 italic">
                    Tip: {step.tips}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      {recipe.tips.length > 0 && (
        <section className="rounded-2xl border border-forge-200 bg-forge-50 p-6">
          <h2 className="font-display text-xl font-semibold text-forge-900 mb-3">
            Chef's Tips
          </h2>
          <ul className="space-y-2">
            {recipe.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-stone-700">
                <span className="text-forge-500 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Origin story */}
      {recipe.originStory && (
        <section className="rounded-2xl bg-stone-900 p-6 text-white">
          <h2 className="font-display text-xl font-semibold mb-2">The Story</h2>
          <p className="text-stone-300 text-sm leading-relaxed">{recipe.originStory}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-stone-500">{icon}</div>
      <span className="text-xs text-stone-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-stone-800 capitalize">{value.toLowerCase()}</span>
    </div>
  );
}
