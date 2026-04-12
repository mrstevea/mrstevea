// FlavorForge — Zustand store for ingredient selection + generation state

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GenerationRequest,
  GenerationResponse,
  DietaryRestriction,
  MealType,
  SkillLevel,
} from "@/types";

interface ForgeStore {
  // Selected ingredients
  ingredients: string[];
  addIngredient:    (name: string) => void;
  removeIngredient: (name: string) => void;
  clearIngredients: () => void;

  // Preferences
  dietary:     DietaryRestriction[];
  cuisine:     string;
  mealType:    MealType | "";
  skillLevel:  SkillLevel;
  maxCookTime: number | null;
  servings:    number;
  budget:      "low" | "medium" | "high";
  equipment:   string[];

  setDietary:     (d: DietaryRestriction[]) => void;
  setCuisine:     (c: string) => void;
  setMealType:    (m: MealType | "") => void;
  setSkillLevel:  (s: SkillLevel) => void;
  setMaxCookTime: (t: number | null) => void;
  setServings:    (n: number) => void;
  setBudget:      (b: "low" | "medium" | "high") => void;
  setEquipment:   (e: string[]) => void;

  // Generation
  isGenerating:    boolean;
  result:          GenerationResponse | null;
  error:           string | null;
  setGenerating:   (v: boolean) => void;
  setResult:       (r: GenerationResponse | null) => void;
  setError:        (e: string | null) => void;

  // Generate action
  generate: () => Promise<void>;
}

export const useForgeStore = create<ForgeStore>()(
  persist(
    (set, get) => ({
      ingredients: [],
      dietary:     [],
      cuisine:     "",
      mealType:    "",
      skillLevel:  "INTERMEDIATE",
      maxCookTime: null,
      servings:    4,
      budget:      "medium",
      equipment:   [],

      isGenerating: false,
      result:       null,
      error:        null,

      addIngredient: (name) =>
        set((s) => ({
          ingredients: s.ingredients.includes(name.toLowerCase().trim())
            ? s.ingredients
            : [...s.ingredients, name.toLowerCase().trim()],
        })),

      removeIngredient: (name) =>
        set((s) => ({ ingredients: s.ingredients.filter((i) => i !== name) })),

      clearIngredients: () => set({ ingredients: [], result: null, error: null }),

      setDietary:     (dietary)     => set({ dietary }),
      setCuisine:     (cuisine)     => set({ cuisine }),
      setMealType:    (mealType)    => set({ mealType }),
      setSkillLevel:  (skillLevel)  => set({ skillLevel }),
      setMaxCookTime: (maxCookTime) => set({ maxCookTime }),
      setServings:    (servings)    => set({ servings }),
      setBudget:      (budget)      => set({ budget }),
      setEquipment:   (equipment)   => set({ equipment }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setResult:     (result)       => set({ result }),
      setError:      (error)        => set({ error }),

      generate: async () => {
        const {
          ingredients, dietary, cuisine, mealType, skillLevel,
          maxCookTime, servings, budget, equipment,
        } = get();

        if (ingredients.length === 0) {
          set({ error: "Add at least one ingredient to forge a recipe." });
          return;
        }

        set({ isGenerating: true, error: null, result: null });

        const req: GenerationRequest = {
          ingredients,
          preferences: {
            dietary:     dietary.length > 0 ? dietary : undefined,
            cuisine:     cuisine || undefined,
            mealType:    (mealType as MealType) || undefined,
            skillLevel,
            maxCookTime: maxCookTime ?? undefined,
            servings,
            budget,
            equipment:   equipment.length > 0 ? equipment : undefined,
          },
        };

        try {
          const res = await fetch("/api/generate", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(req),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? "Generation failed");
          }

          const data: GenerationResponse = await res.json();
          set({ result: data, isGenerating: false });
        } catch (err) {
          set({
            error:       err instanceof Error ? err.message : "Something went wrong",
            isGenerating: false,
          });
        }
      },
    }),
    {
      name:    "flavorforge-state",
      partialize: (s) => ({
        ingredients: s.ingredients,
        dietary:     s.dietary,
        cuisine:     s.cuisine,
        mealType:    s.mealType,
        skillLevel:  s.skillLevel,
        maxCookTime: s.maxCookTime,
        servings:    s.servings,
        budget:      s.budget,
        equipment:   s.equipment,
      }),
    }
  )
);
