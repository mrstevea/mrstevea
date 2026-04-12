"use client";

// FlavorForge — Immersive step-by-step cooking mode

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Timer, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookingStore } from "@/store/cooking";
import { formatTime } from "@/lib/utils";
import type { Recipe } from "@/types";
import { cn } from "@/lib/utils";

interface CookingModeProps {
  recipe: Recipe;
  onExit: () => void;
}

export function CookingMode({ recipe, onExit }: CookingModeProps) {
  const {
    currentStep, completedSteps,
    setRecipe, nextStep, prevStep, toggleStepComplete,
    timer, startTimer, pauseTimer, resumeTimer, stopTimer,
  } = useCookingStore();

  const [timerInput, setTimerInput] = useState("");

  useEffect(() => {
    setRecipe(recipe);
  }, [recipe, setRecipe]);

  const step       = recipe.steps[currentStep - 1];
  const totalSteps = recipe.steps.length;
  const progress   = ((completedSteps.size) / totalSteps) * 100;
  const isDone     = completedSteps.size === totalSteps;

  const formatTimerDisplay = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!step) return null;

  return (
    <div className="min-h-screen bg-stone-900 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-stone-700">
        <Button variant="ghost" size="icon" onClick={onExit} className="text-stone-300 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Cooking</p>
          <h1 className="font-display text-base font-semibold truncate">{recipe.title}</h1>
        </div>
        <span className="text-sm text-stone-400">
          {currentStep} / {totalSteps}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-stone-700">
        <div
          className="h-full bg-forge-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        {isDone ? (
          /* Completion screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-fade-up">
            <div className="text-8xl">🎉</div>
            <h2 className="font-display text-3xl font-bold">
              {recipe.title} is ready!
            </h2>
            <p className="text-stone-400 max-w-sm">
              Beautifully done. Your meal is ready to serve. Enjoy!
            </p>
            <Button size="xl" onClick={onExit} className="mt-4">
              Done Cooking
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6 animate-fade-up" key={currentStep}>
            {/* Step number */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forge-500 text-lg font-bold">
                {currentStep}
              </div>
              {step.duration && (
                <span className="flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1 text-sm text-forge-400">
                  <Timer className="h-3.5 w-3.5" />
                  {step.timerLabel ?? `${step.duration} min`}
                </span>
              )}
            </div>

            {/* Main instruction */}
            <div className="flex-1">
              <p className="text-xl leading-relaxed text-stone-100">
                {step.instruction}
              </p>
              {step.tips && (
                <div className="mt-4 rounded-xl bg-stone-800 p-4">
                  <p className="text-sm text-stone-400">
                    <span className="font-semibold text-forge-400">Tip:</span>{" "}
                    {step.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Timer section */}
            {step.duration && (
              <div className="rounded-2xl bg-stone-800 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-stone-300">Timer</h3>

                {timer ? (
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-4xl font-bold text-forge-400 tabular-nums">
                      {formatTimerDisplay(timer.remaining)}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={timer.isRunning ? pauseTimer : resumeTimer}
                        className="text-stone-300"
                      >
                        {timer.isRunning ? "Pause" : "Resume"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={stopTimer}
                        className="text-stone-400"
                      >
                        Stop
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => startTimer(
                      step.timerLabel ?? `Step ${currentStep}`,
                      step.duration!
                    )}
                    className="gap-2"
                  >
                    <Timer className="h-4 w-4" />
                    Start {step.duration}min timer
                  </Button>
                )}
              </div>
            )}

            {/* Step ingredients reminder */}
            {recipe.ingredients.length > 0 && currentStep === 1 && (
              <div className="rounded-2xl bg-stone-800 p-4">
                <h3 className="text-sm font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                  You'll need
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.slice(0, 6).map((ing, i) => (
                    <span key={i} className="text-xs bg-stone-700 rounded-full px-2.5 py-1 text-stone-300">
                      {ing.quantity ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ""} ` : ""}
                      {ing.name}
                    </span>
                  ))}
                  {recipe.ingredients.length > 6 && (
                    <span className="text-xs text-stone-500">
                      +{recipe.ingredients.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation footer */}
      {!isDone && (
        <footer className="border-t border-stone-700 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-stone-300 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                toggleStepComplete(currentStep);
                if (!completedSteps.has(currentStep)) nextStep();
              }}
              className={cn(
                "flex-1 gap-2 border-stone-600 text-white hover:bg-stone-800",
                completedSteps.has(currentStep) && "border-leaf-500 text-leaf-400"
              )}
            >
              <CheckCircle className={cn(
                "h-5 w-5",
                completedSteps.has(currentStep) && "fill-leaf-500 text-leaf-500"
              )} />
              {completedSteps.has(currentStep) ? "Done" : "Mark complete"}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={nextStep}
              disabled={currentStep === totalSteps}
              className="text-stone-300 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Step dots */}
          <div className="mt-3 flex justify-center gap-1.5 max-w-2xl mx-auto overflow-x-auto">
            {recipe.steps.map((s) => (
              <button
                key={s.stepNumber}
                onClick={() => useCookingStore.getState().goToStep(s.stepNumber)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  s.stepNumber === currentStep
                    ? "w-6 bg-forge-500"
                    : completedSteps.has(s.stepNumber)
                    ? "w-1.5 bg-leaf-500"
                    : "w-1.5 bg-stone-600"
                )}
              />
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
