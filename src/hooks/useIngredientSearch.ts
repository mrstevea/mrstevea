"use client";

import { useState, useEffect, useRef } from "react";
import type { Ingredient } from "@/types";

export function useIngredientSearch(debounceMs = 300) {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<Ingredient[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/ingredients?q=${encodeURIComponent(query)}&limit=10`,
          { signal: abortRef.current.signal }
        );
        const data = await res.json();
        setResults(data.ingredients ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed. Try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, results, isLoading, error };
}
