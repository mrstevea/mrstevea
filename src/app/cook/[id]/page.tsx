"use client";

// /cook/[id] — Immersive cooking mode page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CookingMode } from "@/components/cooking/CookingMode";
import type { Recipe } from "@/types";

export default function CookPage({ params }: { params: { id: string } }) {
  const router   = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/recipes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        // Normalize DB response to Recipe type
        setRecipe({
          ...data,
          ingredients: (data.ingredients ?? []).map((ri: any) => ({
            name:     ri.ingredient?.name ?? ri.name,
            quantity: ri.quantity,
            unit:     ri.unit,
            notes:    ri.notes,
            optional: ri.optional ?? false,
          })),
          nutrition: data.calories
            ? { calories: data.calories, protein: data.protein ?? 0, carbs: data.carbs ?? 0, fat: data.fat ?? 0, fiber: data.fiber ?? 0 }
            : undefined,
        } as Recipe);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button onClick={() => router.back()} className="text-sm underline text-stone-400">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-forge-500 animate-spin" />
      </div>
    );
  }

  return (
    <CookingMode
      recipe={recipe}
      onExit={() => router.push(`/recipe/${recipe.id}`)}
    />
  );
}
