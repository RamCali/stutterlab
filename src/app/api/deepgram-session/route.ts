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

    // Create a temporary API key scoped to transcription only (TTL: 30 seconds)
    const res = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!res.ok) {
      console.error("Deepgram projects error:", await res.text());
      return NextResponse.json(
        { error: "Failed to initialize speech service" },
        { status: 502 }
      );
    }

    const { projects } = await res.json();
    const projectId = projects?.[0]?.project_id;

    if (!projectId) {
      console.error("No Deepgram project found");
      return NextResponse.json(
        { error: "Deepgram project not found" },
        { status: 502 }
      );
    }

    // Create a temporary key with listen scope only
    const keyRes = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: "Temporary STT key",
          scopes: ["usage:write"],
          time_to_live_in_seconds: 30,
        }),
      }
    );

    if (!keyRes.ok) {
      console.error("Deepgram key creation error:", await keyRes.text());
      return NextResponse.json(
        { error: "Failed to create speech session" },
        { status: 502 }
      );
    }

    const { key } = await keyRes.json();

    return NextResponse.json({ apiKey: key });
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
