// FlavorForge — AI Prompt Engineering
// All prompts use structured XML-style tags for reliable Claude parsing.

import { GenerationRequest, MealPlanRequest } from "@/types";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

export const RECIPE_SYSTEM_PROMPT = `You are FlavorForge's AI chef — a world-class culinary expert with deep knowledge of global cuisines, nutrition science, and home cooking techniques.

Your role is to generate practical, delicious, and achievable recipes based on available ingredients and user preferences. You are obsessed with:
- Minimizing food waste by maximizing use of given ingredients
- Adapting recipes to dietary needs without sacrificing flavor
- Providing accurate, actionable instructions that home cooks can follow
- Honest nutrition estimates based on standard USDA data

<rules>
  - Never invent ingredients that weren't provided or are not common pantry staples (salt, pepper, oil, water)
  - Never recommend raw meat in dishes that should be cooked through
  - Always specify cooking temperatures in both Celsius and Fahrenheit
  - Keep instructions clear enough for the specified skill level
  - If dietary restrictions conflict with a recipe idea, adapt — never ignore them
  - Nutrition values are per-serving estimates — label them as estimates
</rules>

<output_format>
  Always respond with valid JSON matching the RecipeOutput schema exactly.
  Do not include markdown, prose, or explanation outside the JSON.
</output_format>`;

// ─── RECIPE GENERATION PROMPT ─────────────────────────────────────────────────

export function buildRecipePrompt(req: GenerationRequest): string {
  const { ingredients, preferences = {} } = req;
  const {
    dietary = [],
    cuisine,
    mealType,
    skillLevel = "INTERMEDIATE",
    equipment = [],
    maxCookTime,
    servings = 4,
    budget = "medium",
  } = preferences;

  return `Generate a recipe using the available ingredients below.

<available_ingredients>
${ingredients.map((i) => `  - ${i}`).join("\n")}
</available_ingredients>

<constraints>
  <skill_level>${skillLevel}</skill_level>
  <servings>${servings}</servings>
  <budget>${budget}</budget>
  ${dietary.length > 0 ? `<dietary_restrictions>${dietary.join(", ")}</dietary_restrictions>` : ""}
  ${cuisine ? `<preferred_cuisine>${cuisine}</preferred_cuisine>` : ""}
  ${mealType ? `<meal_type>${mealType}</meal_type>` : ""}
  ${maxCookTime ? `<max_cook_time_minutes>${maxCookTime}</max_cook_time_minutes>` : ""}
  ${equipment.length > 0 ? `<available_equipment>${equipment.join(", ")}</available_equipment>` : ""}
</constraints>

<instructions>
  1. Create ONE primary recipe that uses as many of the available ingredients as possible
  2. You MAY add common pantry staples (salt, pepper, oil, water, basic spices) — list them in ingredients
  3. Provide 2 alternative recipe ideas (title + brief description only)
  4. Identify any ingredient from the list that might be hard to find and suggest a substitute
  5. Write the origin story as 2-3 engaging sentences about the cuisine/dish history
</instructions>

Respond with this exact JSON structure:
{
  "recipe": {
    "title": "string",
    "description": "string (2-3 sentences, appetizing)",
    "cuisine": "string",
    "mealType": ["BREAKFAST"|"LUNCH"|"DINNER"|"SNACK"|"DESSERT"|"DRINK"],
    "skillLevel": "BEGINNER"|"INTERMEDIATE"|"ADVANCED",
    "dietaryTags": [],
    "prepTime": number,
    "cookTime": number,
    "servings": number,
    "equipment": ["string"],
    "ingredients": [
      {
        "name": "string",
        "quantity": number|null,
        "unit": "string|null",
        "notes": "string|null",
        "optional": false
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "string (clear, complete sentence)",
        "duration": number|null,
        "timerLabel": "string|null",
        "tips": "string|null"
      }
    ],
    "tips": ["string"],
    "nutrition": {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number
    },
    "originStory": "string"
  },
  "alternatives": [
    {
      "title": "string",
      "description": "string",
      "cookTime": number,
      "difficulty": "BEGINNER"|"INTERMEDIATE"|"ADVANCED",
      "reason": "string (why this is a good alternative given the ingredients)"
    }
  ],
  "substitutions": [
    {
      "originalIngredient": "string",
      "substitutes": [
        {
          "name": "string",
          "ratio": "string",
          "notes": "string",
          "dietaryBenefit": "string|null",
          "tasteImpact": "minimal"|"moderate"|"significant"
        }
      ]
    }
  ]
}`;
}

// ─── SUBSTITUTION PROMPT ──────────────────────────────────────────────────────

export function buildSubstitutionPrompt(
  ingredient: string,
  context: { recipe?: string; dietary?: string[] } = {}
): string {
  return `You are a culinary expert specializing in ingredient substitutions.

<ingredient_to_substitute>${ingredient}</ingredient_to_substitute>
${context.recipe ? `<recipe_context>${context.recipe}</recipe_context>` : ""}
${context.dietary?.length ? `<dietary_restrictions>${context.dietary.join(", ")}</dietary_restrictions>` : ""}

Provide 3-5 practical substitutions for this ingredient. Consider:
- Flavor profile matching
- Texture/consistency matching
- Dietary compatibility
- Availability (prefer common supermarket items)
- Conversion ratios

Respond with JSON:
{
  "substitutions": [
    {
      "name": "string",
      "ratio": "string (e.g., '1:1' or 'use 3/4 the amount')",
      "notes": "string (why it works, how flavor differs)",
      "dietaryBenefit": "string|null",
      "tasteImpact": "minimal"|"moderate"|"significant",
      "bestFor": "string (what this sub works best for)"
    }
  ]
}`;
}

// ─── MEAL PLANNER PROMPT ──────────────────────────────────────────────────────

export function buildMealPlannerPrompt(req: MealPlanRequest): string {
  const { preferences = {} } = req;
  const {
    budget,
    calorieTarget,
    maxCookTime,
    dietary = [],
    servings = 2,
  } = preferences;

  return `Generate a balanced 7-day meal plan (Monday through Sunday).

<constraints>
  <servings_per_meal>${servings}</servings_per_meal>
  ${budget ? `<weekly_budget_usd>${budget}</weekly_budget_usd>` : ""}
  ${calorieTarget ? `<daily_calorie_target>${calorieTarget}</daily_calorie_target>` : ""}
  ${maxCookTime ? `<max_cook_time_per_meal_minutes>${maxCookTime}</max_cook_time_per_meal_minutes>` : ""}
  ${dietary.length > 0 ? `<dietary_restrictions>${dietary.join(", ")}</dietary_restrictions>` : ""}
</constraints>

<requirements>
  - Include BREAKFAST, LUNCH, and DINNER for each day (21 meals total)
  - Vary cuisines and ingredients across the week
  - Batch ingredients where possible (e.g., if chicken is used Monday dinner, use remainder Tuesday lunch)
  - Include estimated cost per meal (USD)
  - Include estimated calories per meal
  - Generate a consolidated shopping list grouped by category
  - Minimize food waste (use full ingredient amounts across recipes)
</requirements>

Respond with JSON:
{
  "meals": [
    {
      "dayOfWeek": 0,
      "mealType": "BREAKFAST"|"LUNCH"|"DINNER",
      "title": "string",
      "description": "string",
      "cookTime": number,
      "servings": number,
      "estimatedCost": number,
      "estimatedCalories": number,
      "keyIngredients": ["string"],
      "quickInstructions": "string (2-3 sentence summary)"
    }
  ],
  "shoppingList": [
    {
      "name": "string",
      "quantity": number,
      "unit": "string",
      "category": "string",
      "estimatedCost": number
    }
  ],
  "weekSummary": {
    "totalEstimatedCost": number,
    "avgDailyCalories": number,
    "cuisinesIncluded": ["string"],
    "wasteMinimizationTips": ["string"]
  }
}`;
}

// ─── INGREDIENT DETECTION PROMPT (for image analysis) ─────────────────────────

export const INGREDIENT_DETECTION_PROMPT = `You are analyzing an image of food ingredients, a refrigerator, pantry, or grocery items.

Identify ALL visible food ingredients and produce a structured list.

<rules>
  - Only list items you can clearly identify
  - Group by category (produce, dairy, meat, pantry, etc.)
  - Estimate quantity if visible (e.g., "3 tomatoes", "half a block of cheese")
  - Use common ingredient names, not brand names
  - If uncertain, mark with "possible:" prefix
</rules>

Respond with JSON:
{
  "ingredients": [
    {
      "name": "string",
      "category": "PRODUCE"|"MEAT"|"SEAFOOD"|"DAIRY"|"GRAINS"|"LEGUMES"|"SPICES"|"CONDIMENTS"|"OILS"|"NUTS_SEEDS"|"OTHER",
      "estimatedQuantity": "string|null",
      "confidence": "high"|"medium"|"low"
    }
  ],
  "notes": "string|null (any relevant observation about freshness, variety, etc.)"
}`;

// ─── WASTE REDUCTION PROMPT ───────────────────────────────────────────────────

export function buildWasteReductionPrompt(
  expiringItems: Array<{ name: string; daysLeft: number; quantity?: string }>
): string {
  return `You are a zero-waste chef. Help use these ingredients before they expire.

<expiring_ingredients>
${expiringItems.map((i) => `  - ${i.name}: expires in ${i.daysLeft} day(s)${i.quantity ? `, quantity: ${i.quantity}` : ""}`).join("\n")}
</expiring_ingredients>

Generate 3 recipe ideas that prioritize using the items expiring soonest.
Focus on practical, quick recipes that minimize waste.

Respond with JSON:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "ingredientsUsed": ["string"],
      "wasteScore": number,
      "cookTime": number,
      "urgency": "critical"|"high"|"medium"
    }
  ],
  "preservationTips": [
    {
      "ingredient": "string",
      "tip": "string (how to extend shelf life)"
    }
  ]
}`;
}
