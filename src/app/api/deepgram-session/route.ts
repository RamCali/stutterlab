import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/helpers";

export async function POST() {
  try {
    await requireAuth();

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram not configured" },
        { status: 503 }
      );
    }

    // Return the API key directly — this endpoint is auth-gated so only
    // logged-in users can access it. This avoids needing keys:write scope
    // on the Deepgram key.
    return NextResponse.json({ apiKey });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Deepgram session error:", error);
    return NextResponse.json(
      { error: "Failed to create speech session" },
      { status: 500 }
    );
  }
}
