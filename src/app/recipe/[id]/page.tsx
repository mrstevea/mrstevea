// /recipe/[id] — Recipe detail page

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";
import type { Metadata } from "next";
import type { Recipe } from "@/types";

interface Props {
  params: { id: string };
}

async function getRecipe(id: string) {
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy:  { order: "asc" },
      },
      steps:  { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!recipe) return null;

  // Normalize to Recipe type
  return {
    id:           recipe.id,
    slug:         recipe.slug,
    title:        recipe.title,
    description:  recipe.description,
    cuisine:      recipe.cuisine ?? undefined,
    mealType:     recipe.mealType as Recipe["mealType"],
    skillLevel:   recipe.skillLevel as Recipe["skillLevel"],
    dietaryTags:  recipe.dietaryTags as Recipe["dietaryTags"],
    prepTime:     recipe.prepTime,
    cookTime:     recipe.cookTime,
    totalTime:    recipe.totalTime,
    servings:     recipe.servings,
    ingredients:  recipe.ingredients.map((ri) => ({
      name:     ri.ingredient.name,
      quantity: ri.quantity,
      unit:     ri.unit,
      notes:    ri.notes ?? undefined,
      optional: ri.optional,
    })),
    steps: recipe.steps.map((s) => ({
      stepNumber:  s.stepNumber,
      instruction: s.instruction,
      duration:    s.duration ?? undefined,
      timerLabel:  s.timerLabel ?? undefined,
      tips:        s.tips ?? undefined,
    })),
    tips:          recipe.tips,
    equipment:     recipe.equipment,
    imageUrl:      recipe.imageUrl ?? undefined,
    isAiGenerated: recipe.isAiGenerated,
    nutrition: recipe.calories ? {
      calories: recipe.calories,
      protein:  recipe.protein ?? 0,
      carbs:    recipe.carbs ?? 0,
      fat:      recipe.fat ?? 0,
      fiber:    recipe.fiber ?? 0,
    } : undefined,
    originStory: recipe.originStory ?? undefined,
    ratingAvg:   recipe.ratingAvg,
    ratingCount: recipe.ratingCount,
    saveCount:   recipe.saveCount,
    createdAt:   recipe.createdAt.toISOString(),
  } satisfies Recipe;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe(params.id);
  if (!recipe) return { title: "Recipe Not Found" };

  return {
    title:       recipe.title,
    description: recipe.description,
  };
}

export default async function RecipePage({ params }: Props) {
  const recipe = await getRecipe(params.id);
  if (!recipe) notFound();

  return (
    <main className="px-4 py-8">
      <RecipeDetail recipe={recipe} />
    </main>
  );
}
