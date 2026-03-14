import { NextRequest, NextResponse } from "next/server";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!KLAVIYO_API_KEY) {
      return NextResponse.json({ success: true });
    }

    // Klaviyo API v2024-10-15 — Subscribe profile to list
    // Step 1: Create or update the profile
    const profileRes = await fetch("https://a.klaviyo.com/api/profiles/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        revision: "2024-10-15",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email,
            properties: {
              source: source || "website",
            },
          },
        },
      }),
    });

    if (!profileRes.ok && profileRes.status !== 409) {
      // 409 = profile already exists, which is fine
      console.error("Klaviyo profile create failed:", await profileRes.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Klaviyo subscribe error:", err);
    return NextResponse.json({ success: true });
  }
}
