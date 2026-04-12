// FlavorForge — Anthropic Claude Client
// Wraps the SDK with prompt caching, retries, and structured output validation.

import Anthropic from "@anthropic-ai/sdk";
import {
  RECIPE_SYSTEM_PROMPT,
  buildRecipePrompt,
  buildSubstitutionPrompt,
  buildMealPlannerPrompt,
  buildWasteReductionPrompt,
  INGREDIENT_DETECTION_PROMPT,
} from "./prompts";
import type { GenerationRequest, GenerationResponse, MealPlanRequest } from "@/types";

// Singleton client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

// ─── JSON extraction helper ───────────────────────────────────────────────────

function extractJSON(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─── Recipe Generation ────────────────────────────────────────────────────────

export async function generateRecipe(
  req: GenerationRequest
): Promise<GenerationResponse> {
  const userPrompt = buildRecipePrompt(req);

  // Use the prompt-caching beta API so the static system prompt is cached
  const response = await withRetry(() =>
    anthropic.beta.promptCaching.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type:          "text",
          text:          RECIPE_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    })
  );

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  let parsed: GenerationResponse;
  try {
    parsed = extractJSON(block.text) as GenerationResponse;
  } catch {
    throw new Error(
      `AI response parsing failed. Raw: ${block.text.slice(0, 200)}`
    );
  }

  parsed.recipe.id            = crypto.randomUUID();
  parsed.recipe.slug          = slugify(parsed.recipe.title);
  parsed.recipe.isAiGenerated = true;
  parsed.recipe.totalTime     = parsed.recipe.prepTime + parsed.recipe.cookTime;
  parsed.recipe.ratingAvg     = 0;
  parsed.recipe.ratingCount   = 0;
  parsed.recipe.saveCount     = 0;
  parsed.recipe.createdAt     = new Date().toISOString();

  return parsed;
}

// ─── Ingredient Image Analysis ────────────────────────────────────────────────

export async function detectIngredientsFromImage(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<{ name: string; category: string; confidence: string }[]> {
  const response = await withRetry(() =>
    anthropic.messages.create({
      model:      MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type:   "image",
              source: { type: "base64", media_type: mediaType, data: base64Image },
            },
            { type: "text", text: INGREDIENT_DETECTION_PROMPT },
          ],
        },
      ],
    })
  );

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  const parsed = extractJSON(block.text) as {
    ingredients: { name: string; category: string; confidence: string }[];
  };
  return parsed.ingredients;
}

// ─── Substitution Suggestions ─────────────────────────────────────────────────

export async function getSubstitutions(
  ingredient: string,
  context: { recipe?: string; dietary?: string[] } = {}
) {
  const prompt = buildSubstitutionPrompt(ingredient, context);

  const response = await withRetry(() =>
    anthropic.messages.create({
      model:      MODEL,
      max_tokens: 1024,
      messages:   [{ role: "user", content: prompt }],
    })
  );

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  return extractJSON(block.text) as {
    substitutions: {
      name:           string;
      ratio:          string;
      notes:          string;
      dietaryBenefit: string | null;
      tasteImpact:    string;
      bestFor:        string;
    }[];
  };
}

// ─── Meal Planner ─────────────────────────────────────────────────────────────

export async function generateMealPlan(req: MealPlanRequest) {
  const prompt = buildMealPlannerPrompt(req);

  const response = await withRetry(() =>
    anthropic.beta.promptCaching.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type:          "text",
          text:          "You are a professional meal planning chef and nutritionist. Generate practical, balanced, and budget-conscious meal plans. Always respond with valid JSON only.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    })
  );

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  return extractJSON(block.text);
}

// ─── Waste Reduction ──────────────────────────────────────────────────────────

export async function getWasteReductionRecipes(
  expiringItems: Array<{ name: string; daysLeft: number; quantity?: string }>
) {
  const prompt = buildWasteReductionPrompt(expiringItems);

  const response = await withRetry(() =>
    anthropic.messages.create({
      model:      MODEL,
      max_tokens: 2048,
      messages:   [{ role: "user", content: prompt }],
    })
  );

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  return extractJSON(block.text);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
