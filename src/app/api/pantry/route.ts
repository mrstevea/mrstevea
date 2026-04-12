// GET  /api/pantry          — List user's pantry items (sorted by urgency)
// POST /api/pantry          — Add ingredient to pantry
// DELETE /api/pantry/[id]   — Remove from pantry

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { computeUrgencyScore, daysUntilExpiry } from "@/lib/utils";

const AddPantrySchema = z.object({
  ingredientId: z.string(),
  quantity:     z.number().positive().optional(),
  unit:         z.string().optional(),
  expiresAt:    z.string().datetime().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.pantryItem.findMany({
    where: { userId: session.user.id },
    include: {
      ingredient: {
        select: { id: true, name: true, category: true, imageUrl: true },
      },
    },
    orderBy: [{ urgencyScore: "desc" }, { expiresAt: "asc" }],
  });

  // Recompute urgency scores in real-time
  const enriched = items.map((item) => ({
    ...item,
    daysLeft: item.expiresAt ? daysUntilExpiry(item.expiresAt) : null,
    urgencyScore: item.expiresAt
      ? computeUrgencyScore(daysUntilExpiry(item.expiresAt))
      : 0,
  }));

  // Sort expiring soon first
  const expiring = enriched.filter((i) => i.daysLeft !== null && i.daysLeft <= 7);

  return NextResponse.json({ items: enriched, expiring });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = AddPantrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ingredientId, quantity, unit, expiresAt } = parsed.data;
  const urgencyScore = expiresAt
    ? computeUrgencyScore(daysUntilExpiry(expiresAt))
    : 0;

  const item = await prisma.pantryItem.upsert({
    where:  { userId_ingredientId: { userId: session.user.id, ingredientId } },
    create: {
      userId:       session.user.id,
      ingredientId,
      quantity,
      unit,
      expiresAt:    expiresAt ? new Date(expiresAt) : undefined,
      urgencyScore,
    },
    update: { quantity, unit, expiresAt: expiresAt ? new Date(expiresAt) : undefined, urgencyScore },
    include: { ingredient: true },
  });

  return NextResponse.json(item, { status: 201 });
}
