"use client";

// FlavorForge — Main ingredient input panel
// Supports: text search, voice input, image upload, quick-add chips

import { useState, useRef } from "react";
import { Search, Mic, MicOff, Camera, X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForgeStore } from "@/store/forge";
import { useIngredientSearch } from "@/hooks/useIngredientSearch";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { fileToBase64 } from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_ADD = [
  "Chicken", "Pasta", "Rice", "Eggs", "Garlic",
  "Onion", "Tomato", "Butter", "Olive Oil", "Lemon",
];

export function IngredientInput() {
  const { ingredients, addIngredient, removeIngredient } = useForgeStore();
  const { query, setQuery, results, isLoading } = useIngredientSearch();
  const [imageLoading, setImageLoading] = useState(false);
  const [voiceError,   setVoiceError]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = (name: string) => {
    if (!name.trim()) return;
    addIngredient(name.trim());
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      handleAddText(query);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    // Parse "add chicken, garlic, and pasta" → ["chicken", "garlic", "pasta"]
    const parsed = transcript
      .toLowerCase()
      .replace(/\b(add|and|also|plus)\b/g, ",")
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);

    parsed.forEach(addIngredient);
  };

  const { isListening, isSupported, startListening, stopListening } =
    useVoiceInput({
      onResult: handleVoiceResult,
      onError:  setVoiceError,
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res  = await fetch("/api/generate/image", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const highConf = data.ingredients
        .filter((i: any) => i.confidence !== "low")
        .map((i: any) => i.name);

      highConf.forEach(addIngredient);
    } catch (err) {
      console.error("Image detection failed:", err);
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar + voice + camera */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Type an ingredient…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forge-500 animate-spin" />
            )}
          </div>

          {/* Voice */}
          {isSupported && (
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              title="Voice input"
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Camera / image upload */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageLoading}
            title="Scan fridge / photo"
          >
            {imageLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Search dropdown */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-cream-200 bg-white shadow-card-hover overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleAddText(r.name)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-cream-50 transition-colors text-left"
              >
                <span className="font-medium text-stone-800">{r.name}</span>
                <span className="ml-auto text-xs text-stone-400 capitalize">
                  {r.category.toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {voiceError && (
        <p className="text-xs text-red-500">{voiceError}</p>
      )}

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-forge-600 font-medium animate-fade-up">
          <span className="h-2 w-2 rounded-full bg-forge-500 animate-pulse" />
          Listening… say your ingredients
        </div>
      )}

      {/* Quick-add chips */}
      <div>
        <p className="mb-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.filter((q) => !ingredients.includes(q.toLowerCase())).map((item) => (
            <button
              key={item}
              onClick={() => addIngredient(item)}
              className="inline-flex items-center gap-1 rounded-full border border-cream-300 bg-cream-50 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-forge-50 hover:border-forge-300 hover:text-forge-700 transition-colors"
            >
              <Plus className="h-3 w-3" />
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Selected ingredients */}
      {ingredients.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
            Selected ({ingredients.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1.5 rounded-full bg-forge-100 px-3 py-1 text-sm font-medium text-forge-800"
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  className="ml-0.5 rounded-full hover:bg-forge-200 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
