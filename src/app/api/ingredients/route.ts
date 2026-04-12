// GET /api/ingredients?q=... — Search ingredient catalog

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q        = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? undefined;
  const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  const where: any = {};

  if (q.length >= 1) {
    where.OR = [
      { name:        { contains: q, mode: "insensitive" } },
      { nameAliases: { has:      q } },
    ];
  }
  if (category) where.category = category;

  const ingredients = await prisma.ingredient.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
    select: {
      id:       true,
      name:     true,
      category: true,
      imageUrl: true,
      calories: true,
    },
  });

  return NextResponse.json({ ingredients });
}
