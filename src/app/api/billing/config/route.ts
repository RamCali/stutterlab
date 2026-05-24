import { NextResponse } from "next/server";

const EXPECTED_MONTHLY_PRICE_ID = "price_1T6x0dDNMHfgENPYbF8uijgA";
const EXPECTED_YEARLY_PRICE_ID = "price_1T6x0zDNMHfgENPY37Mq3j80";

function mask(value?: string) {
  if (!value) return null;
  if (value.length <= 10) return "***";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export async function GET() {
  const monthlyPriceId = process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
  const yearlyPriceId = process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY;

  return NextResponse.json({
    provider: "stripe",
    publishableKey: mask(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    monthlyPrice: mask(monthlyPriceId),
    yearlyPrice: mask(yearlyPriceId),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || null,
    checkoutMode: "embedded",
    configured: {
      secretKey: Boolean(process.env.STRIPE_SECRET_KEY),
      publishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      webhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      monthlyPrice: monthlyPriceId === EXPECTED_MONTHLY_PRICE_ID,
      yearlyPrice: yearlyPriceId === EXPECTED_YEARLY_PRICE_ID,
      appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL),
      billingSupportEmail: Boolean(
        process.env.BILLING_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL
      ),
      emailTransport: Boolean(process.env.RESEND_API_KEY),
    },
  });
}
