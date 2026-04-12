import { PrismaClient, IngredientCategory } from "@prisma/client";

const prisma = new PrismaClient();

const INGREDIENTS = [
  // Produce
  { name: "Garlic",      category: IngredientCategory.PRODUCE, calories: 149, aliases: ["garlic cloves", "minced garlic"] },
  { name: "Onion",       category: IngredientCategory.PRODUCE, calories: 40,  aliases: ["onions", "white onion", "yellow onion"] },
  { name: "Tomato",      category: IngredientCategory.PRODUCE, calories: 18,  aliases: ["tomatoes", "roma tomato"] },
  { name: "Lemon",       category: IngredientCategory.PRODUCE, calories: 29,  aliases: ["lemons", "lemon juice"] },
  { name: "Spinach",     category: IngredientCategory.PRODUCE, calories: 23,  aliases: ["baby spinach", "fresh spinach"] },
  { name: "Bell Pepper", category: IngredientCategory.PRODUCE, calories: 31,  aliases: ["peppers", "capsicum"] },
  { name: "Carrot",      category: IngredientCategory.PRODUCE, calories: 41,  aliases: ["carrots"] },
  { name: "Potato",      category: IngredientCategory.PRODUCE, calories: 77,  aliases: ["potatoes", "russet potato"] },
  { name: "Zucchini",    category: IngredientCategory.PRODUCE, calories: 17,  aliases: ["courgette", "zucchinis"] },
  { name: "Mushroom",    category: IngredientCategory.PRODUCE, calories: 22,  aliases: ["mushrooms", "cremini mushrooms"] },

  // Meat
  { name: "Chicken Breast", category: IngredientCategory.MEAT, calories: 165, aliases: ["chicken", "boneless chicken"] },
  { name: "Ground Beef",    category: IngredientCategory.MEAT, calories: 250, aliases: ["minced beef", "beef mince"] },
  { name: "Salmon",         category: IngredientCategory.SEAFOOD, calories: 208, aliases: ["salmon fillet", "salmon fillets"] },
  { name: "Shrimp",         category: IngredientCategory.SEAFOOD, calories: 99, aliases: ["prawns", "tiger prawns"] },

  // Dairy
  { name: "Butter",          category: IngredientCategory.DAIRY, calories: 717, aliases: ["unsalted butter", "salted butter"] },
  { name: "Heavy Cream",     category: IngredientCategory.DAIRY, calories: 340, aliases: ["double cream", "whipping cream"] },
  { name: "Parmesan",        category: IngredientCategory.DAIRY, calories: 431, aliases: ["parmigiano", "parmesan cheese"] },
  { name: "Greek Yogurt",    category: IngredientCategory.DAIRY, calories: 59,  aliases: ["plain yogurt", "strained yogurt"] },
  { name: "Cheddar Cheese",  category: IngredientCategory.DAIRY, calories: 402, aliases: ["cheddar", "sharp cheddar"] },
  { name: "Milk",            category: IngredientCategory.DAIRY, calories: 61,  aliases: ["whole milk", "2% milk"] },
  { name: "Eggs",            category: IngredientCategory.DAIRY, calories: 155, aliases: ["egg", "large eggs"] },

  // Grains
  { name: "Pasta",       category: IngredientCategory.GRAINS, calories: 371, aliases: ["spaghetti", "penne", "fettuccine"] },
  { name: "Rice",        category: IngredientCategory.GRAINS, calories: 365, aliases: ["white rice", "basmati", "jasmine rice"] },
  { name: "Flour",       category: IngredientCategory.GRAINS, calories: 364, aliases: ["all-purpose flour", "plain flour"] },
  { name: "Bread",       category: IngredientCategory.GRAINS, calories: 265, aliases: ["sourdough", "white bread"] },
  { name: "Oats",        category: IngredientCategory.GRAINS, calories: 389, aliases: ["rolled oats", "oatmeal"] },

  // Legumes
  { name: "Chickpeas",     category: IngredientCategory.LEGUMES, calories: 164, aliases: ["garbanzo beans", "canned chickpeas"] },
  { name: "Black Beans",   category: IngredientCategory.LEGUMES, calories: 132, aliases: ["canned black beans"] },
  { name: "Lentils",       category: IngredientCategory.LEGUMES, calories: 116, aliases: ["red lentils", "green lentils"] },

  // Spices
  { name: "Black Pepper",  category: IngredientCategory.SPICES, calories: 251, aliases: ["pepper", "ground pepper"] },
  { name: "Cumin",         category: IngredientCategory.SPICES, calories: 375, aliases: ["ground cumin", "cumin seeds"] },
  { name: "Paprika",       category: IngredientCategory.SPICES, calories: 282, aliases: ["smoked paprika", "sweet paprika"] },
  { name: "Oregano",       category: IngredientCategory.SPICES, calories: 265, aliases: ["dried oregano", "fresh oregano"] },
  { name: "Cinnamon",      category: IngredientCategory.SPICES, calories: 247, aliases: ["ground cinnamon", "cinnamon sticks"] },
  { name: "Turmeric",      category: IngredientCategory.SPICES, calories: 354, aliases: ["ground turmeric"] },
  { name: "Chili Flakes",  category: IngredientCategory.SPICES, calories: 282, aliases: ["red pepper flakes", "crushed chili"] },
  { name: "Salt",          category: IngredientCategory.SPICES, calories: 0,   aliases: ["sea salt", "kosher salt"] },
  { name: "Bay Leaves",    category: IngredientCategory.SPICES, calories: 313, aliases: ["bay leaf", "dried bay leaves"] },

  // Oils & Condiments
  { name: "Olive Oil",       category: IngredientCategory.OILS,       calories: 884, aliases: ["extra virgin olive oil", "EVOO"] },
  { name: "Soy Sauce",       category: IngredientCategory.CONDIMENTS, calories: 53,  aliases: ["light soy sauce", "dark soy sauce"] },
  { name: "Tomato Paste",    category: IngredientCategory.CONDIMENTS, calories: 82,  aliases: ["tomato puree", "double concentrate"] },
  { name: "Dijon Mustard",   category: IngredientCategory.CONDIMENTS, calories: 66,  aliases: ["mustard", "whole grain mustard"] },
  { name: "Honey",           category: IngredientCategory.CONDIMENTS, calories: 304, aliases: ["raw honey", "maple syrup"] },
  { name: "Apple Cider Vinegar", category: IngredientCategory.CONDIMENTS, calories: 22, aliases: ["ACV", "white vinegar"] },
];

async function main() {
  console.log("🌱 Seeding FlavorForge database...");

  for (const ing of INGREDIENTS) {
    await prisma.ingredient.upsert({
      where:  { name: ing.name },
      update: {},
      create: {
        name:        ing.name,
        nameAliases: ing.aliases,
        category:    ing.category,
        calories:    ing.calories,
      },
    });
  }

  console.log(`✅ Seeded ${INGREDIENTS.length} ingredients`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
