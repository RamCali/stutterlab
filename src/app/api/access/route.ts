import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rate = checkRateLimit(`early-access:${ip}`, 10, 60 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many passcode attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { passcode } = await req.json();
  const secret = process.env.EARLY_ACCESS_PASSCODE;

  if (!secret || passcode !== secret) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("stutterlab_access", "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  return res;
}
