// /saved — User's saved recipes

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Saved Recipes" };

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const saved = await prisma.savedRecipe.findMany({
    where:   { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: {
      recipe: {
        select: {
          id: true, slug: true, title: true, description: true,
          cuisine: true, mealType: true, skillLevel: true, dietaryTags: true,
          totalTime: true, servings: true, imageUrl: true,
          ratingAvg: true, saveCount: true, isAiGenerated: true, calories: true,
        },
      },
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900">Saved Recipes</h1>
        <p className="text-stone-500 mt-1">{saved.length} saved recipes</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="font-display text-xl font-semibold text-stone-700 mb-2">No saved recipes yet</h2>
          <p className="text-stone-500 text-sm">
            Forge your first recipe and save it here for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map(({ recipe }) => (
            <RecipeCard
              key={recipe.id}
              recipe={{
                ...recipe,
                cuisine:  recipe.cuisine  ?? undefined,
                imageUrl: recipe.imageUrl ?? undefined,
                calories: recipe.calories ?? undefined,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
