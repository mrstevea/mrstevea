// FlavorForge — Cooking mode state

import { create } from "zustand";
import type { Recipe } from "@/types";

interface TimerState {
  label:     string;
  totalSecs: number;
  remaining: number;
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
}

interface CookingStore {
  recipe:            Recipe | null;
  currentStep:       number;
  completedSteps:    Set<number>;
  servingMultiplier: number;
  timer:             TimerState | null;

  setRecipe:          (r: Recipe) => void;
  goToStep:           (n: number) => void;
  nextStep:           () => void;
  prevStep:           () => void;
  toggleStepComplete: (n: number) => void;
  setServingMultiplier: (m: number) => void;

  startTimer: (label: string, minutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer:  () => void;
  reset:      () => void;
}

export const useCookingStore = create<CookingStore>()((set, get) => ({
  recipe:            null,
  currentStep:       1,
  completedSteps:    new Set(),
  servingMultiplier: 1,
  timer:             null,

  setRecipe: (recipe) =>
    set({ recipe, currentStep: 1, completedSteps: new Set(), timer: null }),

  goToStep: (n) => set({ currentStep: n }),

  nextStep: () => {
    const { recipe, currentStep } = get();
    if (!recipe) return;
    const maxStep = recipe.steps.length;
    if (currentStep < maxStep) set({ currentStep: currentStep + 1 });
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) set({ currentStep: currentStep - 1 });
  },

  toggleStepComplete: (n) => {
    const completed = new Set(get().completedSteps);
    if (completed.has(n)) completed.delete(n);
    else                   completed.add(n);
    set({ completedSteps: completed });
  },

  setServingMultiplier: (servingMultiplier) => set({ servingMultiplier }),

  startTimer: (label, minutes) => {
    const { timer } = get();
    if (timer?.intervalId) clearInterval(timer.intervalId);

    const totalSecs = minutes * 60;
    const intervalId = setInterval(() => {
      const { timer } = get();
      if (!timer || !timer.isRunning) return;

      if (timer.remaining <= 1) {
        clearInterval(timer.intervalId!);
        set({ timer: { ...timer, remaining: 0, isRunning: false, intervalId: null } });
        // Browser notification if supported
        if (typeof window !== "undefined" && "Notification" in window) {
          new Notification(`⏱ ${label} — Done!`);
        }
        return;
      }

      set({ timer: { ...timer, remaining: timer.remaining - 1 } });
    }, 1000);

    set({
      timer: { label, totalSecs, remaining: totalSecs, isRunning: true, intervalId },
    });
  },

  pauseTimer: () => {
    const { timer } = get();
    if (!timer?.intervalId) return;
    clearInterval(timer.intervalId);
    set({ timer: { ...timer, isRunning: false, intervalId: null } });
  },

  resumeTimer: () => {
    const { timer } = get();
    if (!timer || timer.isRunning) return;

    const intervalId = setInterval(() => {
      const { timer } = get();
      if (!timer) return;
      if (timer.remaining <= 1) {
        clearInterval(timer.intervalId!);
        set({ timer: { ...timer, remaining: 0, isRunning: false, intervalId: null } });
        return;
      }
      set({ timer: { ...timer, remaining: timer.remaining - 1 } });
    }, 1000);

    set({ timer: { ...timer, isRunning: true, intervalId } });
  },

  stopTimer: () => {
    const { timer } = get();
    if (timer?.intervalId) clearInterval(timer.intervalId);
    set({ timer: null });
  },

  reset: () => {
    const { timer } = get();
    if (timer?.intervalId) clearInterval(timer.intervalId);
    set({ currentStep: 1, completedSteps: new Set(), timer: null });
  },
}));
