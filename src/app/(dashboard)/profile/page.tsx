// /profile — User profile + preferences + pantry management

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where:   { id: session.user.id },
    select: {
      id:         true,
      name:       true,
      email:      true,
      image:      true,
      skillLevel: true,
      _count: {
        select: {
          recipes:      true,
          savedRecipes: true,
          mealPlans:    true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const pantry = await prisma.pantryItem.findMany({
    where:   { userId: user.id },
    include: { ingredient: { select: { name: true, category: true } } },
    orderBy: [{ urgencyScore: "desc" }, { expiresAt: "asc" }],
    take: 10,
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-forge-400 to-forge-600 flex items-center justify-center text-2xl text-white font-bold overflow-hidden">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ""} className="h-full w-full object-cover" />
          ) : (
            (user.name?.[0] ?? user.email[0]).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            {user.name ?? "Chef"}
          </h1>
          <p className="text-stone-500 text-sm">{user.email}</p>
          <span className="mt-1 inline-block text-xs bg-forge-100 text-forge-700 rounded-full px-2 py-0.5 font-medium capitalize">
            {user.skillLevel.toLowerCase()} Chef
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Recipes Created", value: user._count.recipes },
          { label: "Recipes Saved",   value: user._count.savedRecipes },
          { label: "Meal Plans",      value: user._count.mealPlans },
        ].map((stat) => (
          <div key={stat.label} className="text-center rounded-2xl border border-cream-200 bg-white p-4 shadow-card">
            <div className="text-2xl font-bold text-forge-600">{stat.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pantry */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-stone-900">My Pantry</h2>
          <a href="/forge" className="text-sm text-forge-600 font-medium hover:underline">
            Forge with pantry →
          </a>
        </div>

        {pantry.length === 0 ? (
          <div className="text-center rounded-2xl border-2 border-dashed border-cream-300 py-10">
            <p className="text-stone-400 text-sm">No pantry items tracked yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pantry.map((item) => {
              const urgency =
                item.urgencyScore >= 75 ? "critical" :
                item.urgencyScore >= 50 ? "high" :
                item.urgencyScore >= 25 ? "medium" : "low";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white px-4 py-2.5 shadow-card"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      urgency === "critical" ? "bg-red-500" :
                      urgency === "high"     ? "bg-orange-500" :
                      urgency === "medium"   ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                  <span className="flex-1 text-sm font-medium text-stone-800">
                    {item.ingredient.name}
                  </span>
                  {item.expiresAt && (
                    <span className="text-xs text-stone-400">
                      exp. {new Date(item.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <span className="text-xs capitalize text-stone-400">
                    {item.ingredient.category.toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
