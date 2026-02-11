import { Shield } from "lucide-react";

interface SLPAuthorityBadgeProps {
  variant?: "inline" | "card";
  className?: string;
}

export function SLPAuthorityBadge({ variant = "inline", className = "" }: SLPAuthorityBadgeProps) {
  if (variant === "card") {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 ${className}`}>
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">
            Designed by a Licensed Speech-Language Pathologist
          </p>
          <p className="text-[10px] text-muted-foreground">
            Every exercise, curriculum day, and AI prompt is clinician-designed
          </p>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] text-muted-foreground ${className}`}>
      <Shield className="h-3 w-3 text-primary" />
      Designed by a Licensed SLP
    </span>
  );
}
