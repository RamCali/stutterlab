import Stripe from "stripe";

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

export async function createCheckoutSession(userId: string, email: string) {
  return getStripe().checkout.sessions.create({
    customer_email: email,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_PRO_YEARLY!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
      trial_period_days: 7,
    },
  });
}

export async function createPortalSession(stripeCustomerId: string) {
  return getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });
}
