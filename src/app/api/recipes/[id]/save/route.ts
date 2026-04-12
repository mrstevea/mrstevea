// POST /api/recipes/[id]/save — Toggle save recipe

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.savedRecipe.findUnique({
    where: { userId_recipeId: { userId: session.user.id, recipeId: params.id } },
  });

  if (existing) {
    await prisma.savedRecipe.delete({
      where: { userId_recipeId: { userId: session.user.id, recipeId: params.id } },
    });
    await prisma.recipe.update({
      where: { id: params.id },
      data:  { saveCount: { decrement: 1 } },
    });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedRecipe.create({
      data: { userId: session.user.id, recipeId: params.id },
    });
    await prisma.recipe.update({
      where: { id: params.id },
      data:  { saveCount: { increment: 1 } },
    });
    return NextResponse.json({ saved: true });
  }
}
