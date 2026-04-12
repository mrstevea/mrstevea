"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Users, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDietary } from "@/lib/utils";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Partial<Recipe> & {
    id: string;
    slug: string;
    title: string;
    totalTime?: number;
    cookTime?: number;
    ratingAvg?: number;
    saveCount?: number;
    servings?: number;
    dietaryTags?: string[];
    skillLevel?: string;
    imageUrl?: string | null;
    description?: string;
    calories?: number | null;
  };
  compact?: boolean;
}

export function RecipeCard({ recipe, compact = false }: RecipeCardProps) {
  const time = recipe.totalTime ?? recipe.cookTime ?? 0;

  return (
    <Link href={`/recipe/${recipe.slug ?? recipe.id}`} className="block group">
      <article className="rounded-2xl border border-cream-200 bg-white shadow-card overflow-hidden transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-forge-100 to-cream-100 overflow-hidden">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-40">🍳</span>
            </div>
          )}

          {/* AI badge */}
          {recipe.isAiGenerated && (
            <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              AI Forged
            </div>
          )}

          {/* Save count */}
          {(recipe.saveCount ?? 0) > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <Bookmark className="h-3 w-3" />
              {recipe.saveCount}
            </div>
          )}
        </div>

        <div className={compact ? "p-3" : "p-4"}>
          {/* Skill + dietary badges */}
          {!compact && (
            <div className="flex flex-wrap gap-1 mb-2">
              {recipe.skillLevel && (
                <Badge variant="skill" className="capitalize">
                  {recipe.skillLevel.toLowerCase()}
                </Badge>
              )}
              {recipe.dietaryTags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="leaf">{formatDietary(tag)}</Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-display font-semibold text-stone-900 line-clamp-2 leading-tight ${compact ? "text-sm" : "text-base"}`}>
            {recipe.title}
          </h3>

          {!compact && recipe.description && (
            <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
            {time > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(time)}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recipe.servings}
              </span>
            )}
            {(recipe.ratingAvg ?? 0) > 0 && (
              <span className="flex items-center gap-1 ml-auto text-forge-600 font-medium">
                <Star className="h-3 w-3 fill-forge-400 text-forge-400" />
                {recipe.ratingAvg?.toFixed(1)}
              </span>
            )}
            {recipe.calories && (
              <span className="ml-auto text-stone-400">
                {Math.round(recipe.calories)} cal
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
