// FlavorForge — Core Types

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type MealType   = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "DESSERT" | "DRINK";
export type DietaryRestriction =
  | "VEGETARIAN" | "VEGAN" | "GLUTEN_FREE" | "DAIRY_FREE"
  | "NUT_FREE" | "HALAL" | "KOSHER" | "KETO" | "PALEO" | "LOW_FODMAP";

// ─── Ingredient ───────────────────────────────────────────────────────────────

export interface Ingredient {
  id:       string;
  name:     string;
  category: string;
  imageUrl?: string;
  calories?: number;
}

export interface PantryIngredient extends Ingredient {
  quantity?:    number;
  unit?:        string;
  expiresAt?:   string; // ISO date
  urgencyScore: number; // 0-100
}

// ─── Recipe ───────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  name:     string;
  quantity: number | null;
  unit:     string | null;
  notes?:   string;
  optional: boolean;
}

export interface RecipeStep {
  stepNumber:  number;
  instruction: string;
  duration?:   number; // minutes
  timerLabel?: string;
  tips?:       string;
}

export interface RecipeNutrition {
  calories: number;
  protein:  number;
  carbs:    number;
  fat:      number;
  fiber:    number;
}

export interface Recipe {
  id:          string;
  slug:        string;
  title:       string;
  description: string;
  cuisine?:    string;
  mealType:    MealType[];
  skillLevel:  SkillLevel;
  dietaryTags: DietaryRestriction[];

  prepTime:  number; // minutes
  cookTime:  number; // minutes
  totalTime: number;
  servings:  number;

  ingredients:  RecipeIngredient[];
  steps:        RecipeStep[];
  tips:         string[];
  equipment:    string[];

  imageUrl?:    string;
  isAiGenerated: boolean;

  nutrition?:   RecipeNutrition;
  originStory?: string;

  ratingAvg:    number;
  ratingCount:  number;
  saveCount:    number;

  createdAt: string;
}

// ─── Generation Request / Response ───────────────────────────────────────────

export interface GenerationRequest {
  ingredients:        string[];
  preferences?: {
    dietary?:         DietaryRestriction[];
    cuisine?:         string;
    mealType?:        MealType;
    skillLevel?:      SkillLevel;
    equipment?:       string[];
    maxCookTime?:     number;   // minutes
    servings?:        number;
    budget?:          "low" | "medium" | "high";
  };
}

export interface GenerationResponse {
  recipe:  Recipe;
  alternatives: AlternativeRecipe[];
  substitutions: SubstitutionSuggestion[];
}

export interface AlternativeRecipe {
  title:       string;
  description: string;
  cookTime:    number;
  difficulty:  SkillLevel;
  reason:      string; // why it's a good alternative
}

// ─── Substitutions ────────────────────────────────────────────────────────────

export interface SubstitutionSuggestion {
  originalIngredient: string;
  substitutes: {
    name:             string;
    ratio:            string;  // e.g. "use 3/4 the amount"
    notes:            string;
    dietaryBenefit?:  string;  // e.g. "makes recipe vegan"
    tasteImpact:      "minimal" | "moderate" | "significant";
  }[];
}

// ─── Meal Planner ─────────────────────────────────────────────────────────────

export interface MealPlanRequest {
  weekStart:    string;  // ISO date
  preferences?: {
    budget?:          number;   // weekly $ amount
    calorieTarget?:   number;   // daily calories
    maxCookTime?:     number;   // per-meal minutes
    dietary?:         DietaryRestriction[];
    servings?:        number;
  };
}

export interface MealPlanSlot {
  dayOfWeek:  number;  // 0=Mon, 6=Sun
  mealType:   MealType;
  recipe:     Recipe;
  servings:   number;
}

export interface MealPlan {
  id:           string;
  weekStart:    string;
  slots:        MealPlanSlot[];
  shoppingList: ShoppingItem[];
  totalCost?:   number;
  totalCaloriesPerDay?: number;
}

// ─── Shopping List ────────────────────────────────────────────────────────────

export interface ShoppingItem {
  name:          string;
  quantity?:     number;
  unit?:         string;
  category?:     string;
  checked:       boolean;
  estimatedCost?: number;
}

// ─── Waste Tracking ───────────────────────────────────────────────────────────

export interface WasteAlert {
  ingredient: PantryIngredient;
  daysLeft:   number;
  urgency:    "critical" | "high" | "medium" | "low";
  suggestedRecipes: Pick<Recipe, "id" | "slug" | "title" | "cookTime">[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface ForgeState {
  // Selected ingredients for generation
  selectedIngredients: string[];
  preferences:         GenerationRequest["preferences"];

  // Generated result
  generatedRecipe:     Recipe | null;
  isGenerating:        boolean;
  generationError:     string | null;
}

export interface CookingState {
  recipe:          Recipe;
  currentStep:     number;
  completedSteps:  number[];
  activeTimer:     { label: string; seconds: number; isRunning: boolean } | null;
  servingMultiplier: number;
}
