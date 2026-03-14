import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
