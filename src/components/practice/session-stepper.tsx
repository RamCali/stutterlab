"use client";

import { cn } from "@/lib/utils";
import { Check, Wind, BookOpen, MessageSquare, Heart } from "lucide-react";

const STEPS = [
  { label: "Breathe", icon: Wind },
  { label: "Practice", icon: BookOpen },
  { label: "Speak", icon: MessageSquare },
  { label: "Reflect", icon: Heart },
] as const;

interface SessionStepperProps {
  currentStep: number;
}

export function SessionStepper({ currentStep }: SessionStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1.5 font-medium",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-primary/70"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-full -mt-5",
                  i < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
