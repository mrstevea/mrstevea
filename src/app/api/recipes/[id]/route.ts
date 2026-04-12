// GET  /api/recipes/[id] — Get single recipe with all details
// POST /api/recipes/[id]/save — Toggle save

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipe = await prisma.recipe.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy:  { order: "asc" },
      },
      steps:  { orderBy: { stepNumber: "asc" } },
      author: { select: { id: true, name: true, image: true } },
      ratings: {
        take:    5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Increment view count (fire-and-forget)
  prisma.recipe.update({
    where: { id: recipe.id },
    data:  { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Normalize ingredients to flat structure
  const normalized = {
    ...recipe,
    ingredients: recipe.ingredients.map((ri) => ({
      name:     ri.ingredient.name,
      quantity: ri.quantity,
      unit:     ri.unit,
      notes:    ri.notes,
      optional: ri.optional,
    })),
  };

  return NextResponse.json(normalized);
}
