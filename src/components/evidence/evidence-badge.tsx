import { Badge } from "@/components/ui/badge";
import {
  type EvidenceTier,
  EVIDENCE_TIER_LABELS,
  EVIDENCE_TIER_STYLES,
} from "@/lib/evidence/technique-evidence";
import { cn } from "@/lib/utils";

interface EvidenceBadgeProps {
  tier: EvidenceTier;
  className?: string;
  showFullLabel?: boolean;
}

export function EvidenceBadge({
  tier,
  className,
  showFullLabel = true,
}: EvidenceBadgeProps) {
  const styles = EVIDENCE_TIER_STYLES[tier];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        styles.badge,
        styles.border,
        className,
      )}
    >
      {showFullLabel ? EVIDENCE_TIER_LABELS[tier] : tier}
    </Badge>
  );
}
