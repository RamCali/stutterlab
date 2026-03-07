import Stripe from "stripe";
import type { PlanTier } from "@/lib/auth/premium";

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not yet set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export type BillingInterval = "month" | "year";

/** Map billing interval to Stripe price ID env var */
const PRICE_ENV: Record<BillingInterval, string> = {
  month: "STRIPE_PRICE_ID_PREMIUM_MONTHLY",
  year: "STRIPE_PRICE_ID_PREMIUM_YEARLY",
};

/** Legacy plan price env vars (for existing subscribers) */
const LEGACY_PLAN_PRICE_ENV: Record<string, string> = {
  core: "STRIPE_PRICE_ID_CORE_YEARLY",
  pro: "STRIPE_PRICE_ID_PRO_YEARLY",
  elite: "STRIPE_PRICE_ID_ELITE_YEARLY",
};

export function getPriceIdForPlan(
  plan: PlanTier | "premium" = "pro",
  interval: BillingInterval = "year"
): string {
  // New premium pricing
  const envKey = PRICE_ENV[interval];
  const priceId = process.env[envKey];
  if (priceId) return priceId;

  // Fallback to legacy pricing for existing env vars
  const legacyKey = LEGACY_PLAN_PRICE_ENV[plan];
  if (legacyKey) {
    const legacyPrice = process.env[legacyKey];
    if (legacyPrice) return legacyPrice;
  }

  throw new Error(`No price configured for plan: ${plan}, interval: ${interval}`);
}

/** Reverse lookup: Stripe price ID → plan tier */
export function getPlanForPriceId(priceId: string): PlanTier {
  // Check new premium prices
  if (process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY === priceId) return "pro";
  if (process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY === priceId) return "pro";

  // Check legacy prices
  for (const [plan, envKey] of Object.entries(LEGACY_PLAN_PRICE_ENV)) {
    if (process.env[envKey] === priceId) return plan as PlanTier;
  }
  return "pro"; // fallback — treat all paid as premium
}

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL or NEXTAUTH_URL must be set");
  return url;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  interval: BillingInterval = "year"
) {
  const priceId = getPriceIdForPlan("premium", interval);
  const appUrl = getAppUrl();

  return getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    customer_email: email,
    mode: "subscription",
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    return_url: `${appUrl}/app/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { userId, plan: "pro" },
    subscription_data: {
      metadata: { userId, plan: "pro" },
      trial_period_days: 7,
    },
  });
}

export async function createPortalSession(stripeCustomerId: string) {
  return getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getAppUrl()}/app/settings`,
  });
}
