import { afterEach, describe, expect, it } from "vitest";
import { getPlanForPriceId, getPriceIdForPlan } from "@/lib/stripe";

const ORIGINAL_ENV = process.env;

describe("Stripe pricing config", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns the configured premium monthly and yearly price IDs", () => {
    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY = "price_yearly";

    expect(getPriceIdForPlan("pro", "month")).toBe("price_monthly");
    expect(getPriceIdForPlan("pro", "year")).toBe("price_yearly");
  });

  it("maps premium price IDs back to the pro plan", () => {
    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY = "price_monthly";
    process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY = "price_yearly";

    expect(getPlanForPriceId("price_monthly")).toBe("pro");
    expect(getPlanForPriceId("price_yearly")).toBe("pro");
  });

  it("throws a clear error when no price is configured", () => {
    delete process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
    delete process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY;
    delete process.env.STRIPE_PRICE_ID_CORE_YEARLY;
    delete process.env.STRIPE_PRICE_ID_PRO_YEARLY;
    delete process.env.STRIPE_PRICE_ID_ELITE_YEARLY;

    expect(() => getPriceIdForPlan("pro", "year")).toThrow(
      "No price configured for plan: pro, interval: year"
    );
  });
});
