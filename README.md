# FlavorForge

**Create Recipes. Cook Anything. Waste Nothing.**

FlavorForge is an AI-powered recipe generation platform that turns available ingredients into personalized meals — built with Next.js 14, Prisma, PostgreSQL, and the Claude API.

---

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Frontend     | Next.js 14 (App Router), React 18, TypeScript        |
| Styling      | Tailwind CSS, custom design system, Framer Motion    |
| AI           | Anthropic Claude (claude-sonnet-4-6) with prompt caching |
| Database     | PostgreSQL + Prisma ORM                              |
| Auth         | NextAuth.js v5 (Credentials + Google OAuth)          |
| State        | Zustand (client-side store with persistence)         |
| Voice        | Web Speech API (browser-native)                      |
| Image Upload | Multipart FormData → Claude Vision API               |

---

## Core Features

### The Forge (AI Recipe Generator)
- Manual text ingredient input with autocomplete
- Voice input (Web Speech API) — say your ingredients naturally
- Image upload — photo your fridge, Claude detects ingredients
- Quick-add chips for common ingredients
- Preferences: dietary restrictions, cuisine, skill level, equipment, cook time, budget

### AI Recipe Output
- Full structured recipe: ingredients, steps, nutrition, origin story
- Serving size adjuster (0.5x–3x scaling)
- Substitution suggestions with taste-impact ratings
- 2 alternative recipe ideas

### Cooking Mode
- Full-screen step-by-step guided experience
- Built-in countdown timers per step
- Progress tracking with step completion dots
- Serving adjustment

### Weekly Meal Planner
- AI-generated 7-day meal plan (breakfast/lunch/dinner)
- Budget, calorie, cook-time constraints
- Integrated shopping list with cost estimates
- Zero-waste tips

### Waste Reduction Engine
- Pantry tracking with expiration dates
- Urgency scoring (0–100) based on days remaining
- Recipe suggestions prioritizing expiring ingredients

### Save & Share
- Save recipes to your profile
- Share via URL (recipe slugs)
- Collections for organization

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Auth-protected dashboard routes
│   ├── api/                # API route handlers
│   │   ├── generate/       # Recipe generation (text + image)
│   │   ├── recipes/        # CRUD + save/rate
│   │   ├── planner/        # Meal plan generation
│   │   ├── ingredients/    # Ingredient search
│   │   ├── pantry/         # Pantry CRUD
│   │   └── substitutions/  # Substitution engine
│   ├── recipe/[id]/        # Recipe detail page
│   ├── cook/[id]/          # Immersive cooking mode
│   └── login/              # Auth pages
├── components/
│   ├── forge/              # ForgeView + RecipeResult
│   ├── ingredients/        # IngredientInput + PreferencesPanel
│   ├── recipe/             # RecipeCard + RecipeDetail
│   ├── cooking/            # CookingMode
│   ├── planner/            # WeeklyPlanner
│   ├── layout/             # Navbar
│   └── ui/                 # Button, Card, Badge, Input, Skeleton
├── lib/
│   ├── ai/                 # Claude client + prompt templates
│   ├── auth/               # NextAuth config
│   ├── db/                 # Prisma singleton
│   └── utils.ts            # Helpers
├── store/                  # Zustand stores
│   ├── forge.ts            # Ingredient selection + generation state
│   └── cooking.ts          # Cooking mode + timer state
├── hooks/                  # Custom React hooks
│   ├── useVoiceInput.ts
│   └── useIngredientSearch.ts
├── types/                  # TypeScript interfaces
└── prisma/
    ├── schema.prisma       # Full database schema
    └── seed.ts             # Ingredient catalog seed
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in DATABASE_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET
```

### 3. Set up database
```bash
npm run db:push     # Apply schema
npm run db:seed     # Seed ingredient catalog
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## AI Prompt Engineering

All prompts live in `src/lib/ai/prompts.ts`.

### Recipe Generation Strategy
- Structured XML-style tags for reliable parsing
- System prompt cached via Anthropic's prompt caching (reduces latency + cost)
- Strict JSON schema output with fallback error handling
- Guardrails: explicit rules for dietary restrictions, cooking temperatures, skill-level calibration

### Substitution Engine
- DB-first: checks precomputed substitutes before hitting the API
- AI fallback for novel or context-specific substitutions (dietary context aware)
- `tasteImpact` rating (minimal/moderate/significant) for informed decision-making

### Meal Planner
- Batch-ingredient optimization prompt (reduce waste across 21 meals)
- Structured output: meals + shopping list + weekly summary in one call

---

## Design System

**Colors:**
- Primary: `forge-500` (#F97316) — warm amber/orange
- Secondary: `leaf-500` (#22C55E) — fresh green
- Background: `cream-50` (#FAFAF7) — warm off-white
- Text: Stone scale (Tailwind)

**Typography:**
- Display: Playfair Display (serif) — headings, titles
- Body: Inter (sans-serif) — all body text
- Mono: System monospace — measurements

**Components:** Radix UI primitives + custom variants via CVA

---

## MVP Roadmap

### Phase 1 — MVP (Shipped)
- [x] AI recipe generation from ingredients
- [x] Voice + image ingredient input
- [x] Cooking mode with timers
- [x] Weekly meal planner
- [x] Save/share recipes
- [x] Pantry + waste tracking
- [x] Substitution engine

### Phase 2 — Growth
- [ ] Recipe rating + reviews
- [ ] Social feed (trending forged recipes)
- [ ] Grocery API integration (Instacart/Kroger)
- [ ] Mobile app (React Native)
- [ ] Push notifications for expiring pantry items
- [ ] Recipe image generation (DALL-E/Stable Diffusion)

### Phase 3 — Scale
- [ ] Creator economy (share + monetize recipes)
- [ ] Community challenges
- [ ] Restaurant API integrations
- [ ] Smart appliance integrations (Thermomix, etc.)
- [ ] Subscription tier (FlavorForge Pro)

---

## Monetization

1. **Freemium**: 5 AI generations/day free → unlimited on Pro ($9.99/month)
2. **FlavorForge Pro**: Meal planning, pantry tracking, advanced preferences
3. **Affiliate**: Grocery delivery cart integration (Instacart, Amazon Fresh)
4. **B2B**: White-label API for meal kit companies

---

## License

MIT
