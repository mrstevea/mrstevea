// POST /api/planner — Generate AI meal plan
// GET  /api/planner — Get user's current week meal plan

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateMealPlan } from "@/lib/ai/client";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";

const PlannerSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferences: z.object({
    budget:        z.number().positive().optional(),
    calorieTarget: z.number().int().positive().optional(),
    maxCookTime:   z.number().int().positive().max(180).optional(),
    dietary:       z.array(z.string()).optional(),
    servings:      z.number().int().min(1).max(20).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = PlannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const plan = await generateMealPlan(parsed.data);
    return NextResponse.json(plan, { status: 200 });
  } catch (err) {
    console.error("[/api/planner]", err);
    return NextResponse.json(
      { error: "Failed to generate meal plan." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const weekStart = searchParams.get("weekStart");

  const plan = await prisma.mealPlan.findFirst({
    where: {
      userId:    session.user.id,
      ...(weekStart ? { weekStart: new Date(weekStart) } : {}),
    },
    include: {
      slots: {
        include: {
          recipe: {
            select: {
              id: true, slug: true, title: true, imageUrl: true,
              cookTime: true, calories: true, dietaryTags: true,
            },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
      },
    },
    orderBy: { weekStart: "desc" },
  });

  return NextResponse.json(plan ?? null);
}
