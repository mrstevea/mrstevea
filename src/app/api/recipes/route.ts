// GET /api/recipes — List / search recipes

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1", 10));
  const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "12", 10));
  const q        = searchParams.get("q")?.trim() ?? "";
  const cuisine  = searchParams.get("cuisine") ?? undefined;
  const dietary  = searchParams.getAll("dietary");
  const sort     = searchParams.get("sort") ?? "recent"; // recent | popular | rating

  const where: any = {};

  if (q) {
    where.OR = [
      { title:       { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (cuisine) where.cuisine = { equals: cuisine, mode: "insensitive" };
  if (dietary.length > 0) where.dietaryTags = { hasSome: dietary };

  const orderBy =
    sort === "popular" ? { saveCount: "desc" as const }
    : sort === "rating" ? { ratingAvg: "desc" as const }
    : { createdAt:  "desc" as const };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy,
      skip:  (page - 1) * limit,
      take:  limit,
      select: {
        id:          true,
        slug:        true,
        title:       true,
        description: true,
        cuisine:     true,
        mealType:    true,
        skillLevel:  true,
        dietaryTags: true,
        prepTime:    true,
        cookTime:    true,
        totalTime:   true,
        servings:    true,
        imageUrl:    true,
        ratingAvg:   true,
        ratingCount: true,
        saveCount:   true,
        isAiGenerated: true,
        calories:    true,
        createdAt:   true,
        author: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  return NextResponse.json({
    recipes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
