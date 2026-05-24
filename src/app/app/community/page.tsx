import { CommunityExperience } from "@/components/community/community-experience";
import { PremiumGate } from "@/components/premium-gate";
import { getUserId } from "@/lib/auth/helpers";
import { getTrialDaysLeft, getUserPlan } from "@/lib/auth/premium";

export default async function CommunityPage() {
  const userId = await getUserId();
  const currentPlan = userId ? await getUserPlan(userId) : "free";
  const trialDaysLeft = userId ? await getTrialDaysLeft(userId) : undefined;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PremiumGate
        requiredPlan="core"
        currentPlan={currentPlan}
        trialDaysLeft={trialDaysLeft}
        featureName="Private Member Community"
        description="Community is included with StutterLab Premium: wins, accountability, peer support, and real-world speaking challenges."
      >
        <CommunityExperience />
      </PremiumGate>
    </div>
  );
}
