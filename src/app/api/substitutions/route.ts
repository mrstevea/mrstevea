// POST /api/substitutions — Get substitution suggestions for an ingredient

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSubstitutions } from "@/lib/ai/client";
import { prisma } from "@/lib/db/client";

const SubSchema = z.object({
  ingredient: z.string().min(1).max(100),
  recipeId:   z.string().optional(),
  dietary:    z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = SubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Check if we have precomputed substitutes in DB first
    const { ingredient, recipeId, dietary } = parsed.data;

    const dbSubstitutes = await prisma.ingredient.findFirst({
      where: { name: { equals: ingredient, mode: "insensitive" } },
      include: {
        substitutes: {
          include: { substitute: { select: { name: true } } },
        },
      },
    });

    // If DB has good substitutes and no dietary filter, use those
    if (
      dbSubstitutes?.substitutes.length &&
      dbSubstitutes.substitutes.length >= 3 &&
      !dietary?.length
    ) {
      return NextResponse.json({
        source: "database",
        substitutions: dbSubstitutes.substitutes.map((s) => ({
          name:   s.substitute.name,
          ratio:  `1:${s.conversionRatio}`,
          notes:  s.notes ?? "",
          tasteImpact: "moderate",
        })),
      });
    }

    // Fall back to AI
    let recipeContext: string | undefined;
    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where:  { id: recipeId },
        select: { title: true },
      });
      recipeContext = recipe?.title;
    }

    const result = await getSubstitutions(ingredient, {
      recipe: recipeContext,
      dietary,
    });

    return NextResponse.json({ source: "ai", ...result });
  } catch (err) {
    console.error("[/api/substitutions]", err);
    return NextResponse.json(
      { error: "Failed to get substitutions." },
      { status: 500 }
    );
  }
}
