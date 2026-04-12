// POST /api/generate — Core recipe generation endpoint

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRecipe } from "@/lib/ai/client";
import type { GenerationRequest } from "@/types";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";

const GenerateSchema = z.object({
  ingredients: z
    .array(z.string().min(1).max(100))
    .min(1, "At least one ingredient required")
    .max(30, "Maximum 30 ingredients"),
  preferences: z
    .object({
      dietary:     z.array(z.string()).optional(),
      cuisine:     z.string().optional(),
      mealType:    z.string().optional(),
      skillLevel:  z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      equipment:   z.array(z.string()).optional(),
      maxCookTime: z.number().int().positive().max(480).optional(),
      servings:    z.number().int().min(1).max(20).optional(),
      budget:      z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await generateRecipe(parsed.data as GenerationRequest);

    // Optionally persist to DB if user is authenticated
    const session = await auth();
    if (session?.user?.id) {
      try {
        await persistRecipe(result.recipe, session.user.id);
      } catch {
        // Persistence failure should not block the response
        console.error("Failed to persist recipe");
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[/api/generate]", err);
    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again." },
      { status: 500 }
    );
  }
}

async function persistRecipe(recipe: any, userId: string) {
  // Upsert each ingredient
  const ingredientRecords = await Promise.all(
    recipe.ingredients.map(async (ri: any) => {
      const ingredient = await prisma.ingredient.upsert({
        where:  { name: ri.name },
        create: { name: ri.name, category: "OTHER", nameAliases: [] },
        update: {},
      });
      return { ingredient, ri };
    })
  );

  await prisma.recipe.create({
    data: {
      id:           recipe.id,
      slug:         recipe.slug,
      title:        recipe.title,
      description:  recipe.description,
      authorId:     userId,
      cuisine:      recipe.cuisine,
      mealType:     recipe.mealType ?? [],
      skillLevel:   recipe.skillLevel ?? "INTERMEDIATE",
      dietaryTags:  recipe.dietaryTags ?? [],
      prepTime:     recipe.prepTime,
      cookTime:     recipe.cookTime,
      totalTime:    recipe.totalTime,
      servings:     recipe.servings,
      tips:         recipe.tips ?? [],
      equipment:    recipe.equipment ?? [],
      isAiGenerated: true,
      aiModel:      "claude-sonnet-4-6",
      calories:     recipe.nutrition?.calories,
      protein:      recipe.nutrition?.protein,
      carbs:        recipe.nutrition?.carbs,
      fat:          recipe.nutrition?.fat,
      fiber:        recipe.nutrition?.fiber,
      originStory:  recipe.originStory,
      ingredients: {
        create: ingredientRecords.map(({ ingredient, ri }, idx) => ({
          ingredientId: ingredient.id,
          quantity:     ri.quantity,
          unit:         ri.unit,
          notes:        ri.notes,
          optional:     ri.optional ?? false,
          order:        idx,
        })),
      },
      steps: {
        create: recipe.steps.map((step: any) => ({
          stepNumber:  step.stepNumber,
          instruction: step.instruction,
          duration:    step.duration,
          timerLabel:  step.timerLabel,
          tips:        step.tips,
        })),
      },
    },
  });
}
