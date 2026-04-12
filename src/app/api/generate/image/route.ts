// POST /api/generate/image — Detect ingredients from uploaded image

import { NextRequest, NextResponse } from "next/server";
import { detectIngredientsFromImage } from "@/lib/ai/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image too large. Max 5MB." },
        { status: 413 }
      );
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPEG, PNG, or WebP." },
        { status: 415 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const ingredients = await detectIngredientsFromImage(
      base64,
      file.type as "image/jpeg" | "image/png" | "image/webp"
    );

    return NextResponse.json({ ingredients }, { status: 200 });
  } catch (err) {
    console.error("[/api/generate/image]", err);
    return NextResponse.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 }
    );
  }
}
