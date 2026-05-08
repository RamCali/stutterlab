import { NextResponse } from "next/server";

function mask(value?: string) {
  if (!value) return null;
  if (value.length <= 10) return "***";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export async function GET() {
  return NextResponse.json({
    provider: "stripe",
    publishableKey: mask(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    monthlyPrice: mask(process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY),
    yearlyPrice: mask(process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || null,
    checkoutMode: "embedded",
  });
}
