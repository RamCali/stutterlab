import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { logError, measureAsync } from "@/lib/observability/logger";
import { fetchWithTimeout } from "@/lib/observability/timeout";
import { buildXaiCoffeeShopPhonePracticePrompt } from "@/lib/xai/voice";

export const runtime = "nodejs";

const textTestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  scenarioId: z.string().trim().max(80).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1200),
      })
    )
    .max(20)
    .optional(),
});

const XAI_TEXT_MODEL = process.env.XAI_TEXT_MODEL || "grok-4.3";

export async function POST(request: NextRequest) {
  try {
    const isLocalDev = process.env.NODE_ENV === "development";
    const user = isLocalDev ? { id: "local-dev" } : await requireAuth();

    const hasPremium = isLocalDev || (await isPremium(user.id));
    if (!hasPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for xAI phone practice" },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(
      `xai-phone-practice-text-test:${user.id}`,
      20,
      60 * 60 * 1000
    );
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many xAI tests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = textTestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "xAI is not configured. Add XAI_API_KEY to .env." },
        { status: 503 }
      );
    }

    const reply = await measureAsync(
      "provider.xai.phone_practice_text_test",
      {
        provider: "xai",
        model: XAI_TEXT_MODEL,
        endpoint: "chat_completions_text_test",
      },
      () =>
        runXaiChatTextTest(
          apiKey,
          parsed.data.message,
          parsed.data.messages || [],
          parsed.data.scenarioId
        )
    );

    return NextResponse.json({
      provider: "xai",
      model: XAI_TEXT_MODEL,
      message: reply,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logError("provider.xai.phone_practice_text_test.error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "xAI text test failed" },
      { status: 500 }
    );
  }
}

async function runXaiChatTextTest(
  apiKey: string,
  message: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  scenarioId?: string
) {
  const conversationMessages = [...messages, { role: "user" as const, content: message }];

  const response = await fetchWithTimeout(
    "https://api.x.ai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XAI_TEXT_MODEL,
        stream: false,
        max_tokens: 120,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: buildXaiCoffeeShopPhonePracticePrompt(scenarioId),
          },
          ...conversationMessages,
        ],
      }),
    },
    30000,
    "xAI phone practice text test"
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "xAI chat request failed";
    throw new Error(message);
  }

  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("No response text received from xAI.");
  }

  return reply.trim();
}
