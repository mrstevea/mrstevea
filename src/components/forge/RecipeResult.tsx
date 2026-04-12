"use client";

// FlavorForge — Recipe generation result screen

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Play, Bookmark, Share2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";
import { formatTime, formatDietary } from "@/lib/utils";
import type { GenerationResponse, AlternativeRecipe } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeResultProps {
  result:    GenerationResponse;
  onBack:    () => void;
  onReforge: () => void;
}

export function RecipeResult({ result, onBack, onReforge }: RecipeResultProps) {
  const [showAlts,   setShowAlts]   = useState(false);
  const [showSubs,   setShowSubs]   = useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [isReforging, setIsReforging] = useState(false);

  const { recipe, alternatives, substitutions } = result;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/recipes/${recipe.id}/save`, { method: "POST" });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReforge = async () => {
    setIsReforging(true);
    await onReforge();
    setIsReforging(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-stone-500">
          <ArrowLeft className="h-4 w-4" />
          Change ingredients
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReforge}
            disabled={isReforging}
            className="gap-1.5"
          >
            {isReforging ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Reforge
          </Button>
        </div>
      </div>

      {/* Main recipe */}
      <div className="animate-fade-up">
        <RecipeDetail recipe={recipe} />
      </div>

      {/* Substitutions */}
      {substitutions.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
          <button
            onClick={() => setShowSubs((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">
                Ingredient Substitutions
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Missing something? Here are alternatives
              </p>
            </div>
            {showSubs ? (
              <ChevronUp className="h-4 w-4 text-amber-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-600" />
            )}
          </button>

          {showSubs && (
            <div className="px-5 pb-5 space-y-4 animate-fade-up">
              {substitutions.map((sub) => (
                <div key={sub.originalIngredient}>
                  <h4 className="text-sm font-semibold text-stone-800 mb-2">
                    Instead of <span className="text-forge-700">{sub.originalIngredient}</span>:
                  </h4>
                  <div className="space-y-2">
                    {sub.substitutes.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-white border border-amber-100 p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-stone-800">{s.name}</span>
                            <span className="text-xs text-stone-400">{s.ratio}</span>
                            <Badge
                              variant={
                                s.tasteImpact === "minimal" ? "low" :
                                s.tasteImpact === "moderate" ? "medium" : "high"
                              }
                              className="ml-auto capitalize"
                            >
                              {s.tasteImpact} impact
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-500">{s.notes}</p>
                          {s.dietaryBenefit && (
                            <span className="inline-block mt-1 text-xs text-leaf-700 bg-leaf-50 rounded-full px-2 py-0.5">
                              {s.dietaryBenefit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alternative recipes */}
      {alternatives.length > 0 && (
        <div className="rounded-2xl border border-cream-200 bg-white overflow-hidden shadow-card">
          <button
            onClick={() => setShowAlts((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Alternative Recipes
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {alternatives.length} other ideas with your ingredients
              </p>
            </div>
            {showAlts ? (
              <ChevronUp className="h-4 w-4 text-stone-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-stone-400" />
            )}
          </button>

          {showAlts && (
            <div className="px-5 pb-5 space-y-3 animate-fade-up">
              {alternatives.map((alt, i) => (
                <AlternativeCard key={i} alt={alt} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlternativeCard({ alt }: { alt: AlternativeRecipe }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-50 p-4 hover:bg-forge-50 hover:border-forge-200 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-stone-900">{alt.title}</h4>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{alt.description}</p>
          <p className="text-xs text-forge-600 mt-1 italic">{alt.reason}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="skill" className="capitalize">{alt.difficulty.toLowerCase()}</Badge>
          <span className="text-xs text-stone-400">{formatTime(alt.cookTime)}</span>
        </div>
      </div>
    </div>
  );
}
