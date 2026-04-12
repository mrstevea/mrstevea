"use client";

import { useForgeStore } from "@/store/forge";
import { cn } from "@/lib/utils";
import type { DietaryRestriction, SkillLevel, MealType } from "@/types";

const DIETARY_OPTIONS: { label: string; value: DietaryRestriction }[] = [
  { label: "Vegetarian",  value: "VEGETARIAN"  },
  { label: "Vegan",       value: "VEGAN"       },
  { label: "Gluten-Free", value: "GLUTEN_FREE" },
  { label: "Dairy-Free",  value: "DAIRY_FREE"  },
  { label: "Keto",        value: "KETO"        },
  { label: "Paleo",       value: "PALEO"       },
  { label: "Halal",       value: "HALAL"       },
  { label: "Kosher",      value: "KOSHER"      },
];

const MEAL_TYPES: { label: string; value: MealType; emoji: string }[] = [
  { label: "Breakfast", value: "BREAKFAST", emoji: "☀️" },
  { label: "Lunch",     value: "LUNCH",     emoji: "🌤️" },
  { label: "Dinner",    value: "DINNER",    emoji: "🌙" },
  { label: "Snack",     value: "SNACK",     emoji: "🍎" },
  { label: "Dessert",   value: "DESSERT",   emoji: "🍰" },
];

const SKILL_LEVELS: { label: string; value: SkillLevel; desc: string }[] = [
  { label: "Beginner",     value: "BEGINNER",     desc: "Simple, forgiving recipes" },
  { label: "Intermediate", value: "INTERMEDIATE", desc: "Some technique required"   },
  { label: "Advanced",     value: "ADVANCED",     desc: "Complex, chef-level"       },
];

const EQUIPMENT_OPTIONS = [
  { label: "Oven",        value: "oven"        },
  { label: "Air Fryer",   value: "air_fryer"   },
  { label: "Instant Pot", value: "instant_pot" },
  { label: "Blender",     value: "blender"     },
  { label: "Grill",       value: "grill"       },
  { label: "Wok",         value: "wok"         },
];

export function PreferencesPanel() {
  const {
    dietary, setDietary,
    mealType, setMealType,
    skillLevel, setSkillLevel,
    maxCookTime, setMaxCookTime,
    servings, setServings,
    equipment, setEquipment,
    cuisine, setCuisine,
    budget, setBudget,
  } = useForgeStore();

  const toggleDietary = (val: DietaryRestriction) =>
    setDietary(
      dietary.includes(val)
        ? dietary.filter((d) => d !== val)
        : [...dietary, val]
    );

  const toggleEquipment = (val: string) =>
    setEquipment(
      equipment.includes(val)
        ? equipment.filter((e) => e !== val)
        : [...equipment, val]
    );

  return (
    <div className="space-y-6">
      {/* Meal type */}
      <section>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Meal Type
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMealType(mealType === m.value ? "" : m.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-medium transition-all",
                mealType === m.value
                  ? "bg-forge-100 text-forge-700 ring-2 ring-forge-400"
                  : "bg-cream-50 text-stone-500 hover:bg-cream-100"
              )}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Dietary restrictions */}
      <section>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Dietary
        </h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => toggleDietary(d.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                dietary.includes(d.value)
                  ? "bg-leaf-100 text-leaf-700 ring-1 ring-leaf-400"
                  : "bg-cream-50 text-stone-500 hover:bg-cream-100 border border-cream-200"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Skill level */}
      <section>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Skill Level
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SKILL_LEVELS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSkillLevel(s.value)}
              className={cn(
                "flex flex-col rounded-xl p-3 text-left transition-all",
                skillLevel === s.value
                  ? "bg-forge-500 text-white"
                  : "bg-cream-50 text-stone-600 hover:bg-cream-100 border border-cream-200"
              )}
            >
              <span className="text-sm font-semibold">{s.label}</span>
              <span className={cn("text-xs mt-0.5", skillLevel === s.value ? "text-forge-100" : "text-stone-400")}>
                {s.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Cook time + servings */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
            Max Cook Time
          </label>
          <select
            value={maxCookTime ?? ""}
            onChange={(e) => setMaxCookTime(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-forge-400"
          >
            <option value="">Any</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
            Servings
          </label>
          <select
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-forge-400"
          >
            {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Cuisine preference */}
      <section>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
          Cuisine (optional)
        </label>
        <input
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="e.g. Italian, Thai, Mexican…"
          className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forge-400"
        />
      </section>

      {/* Equipment */}
      <section>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Available Equipment
        </h3>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq.value}
              onClick={() => toggleEquipment(eq.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                equipment.includes(eq.value)
                  ? "bg-stone-800 text-white"
                  : "bg-cream-50 text-stone-500 hover:bg-cream-100 border border-cream-200"
              )}
            >
              {eq.label}
            </button>
          ))}
        </div>
      </section>

      {/* Budget */}
      <section>
        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Budget
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(["low", "medium", "high"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={cn(
                "rounded-xl py-2 text-sm font-medium capitalize transition-all",
                budget === b
                  ? "bg-forge-500 text-white"
                  : "bg-cream-50 text-stone-500 hover:bg-cream-100 border border-cream-200"
              )}
            >
              {b === "low" ? "💰" : b === "medium" ? "💰💰" : "💰💰💰"} {b}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
