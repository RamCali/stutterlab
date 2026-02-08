import { onCall, HttpsError } from "firebase-functions/v2/https";
import Anthropic from "@anthropic-ai/sdk";
import { defineString } from "firebase-functions/params";

const anthropicApiKey = defineString("ANTHROPIC_API_KEY");

// Scenario system prompts — ported from src/app/api/ai-conversation/route.ts
const SCENARIO_PROMPTS: Record<string, string> = {
  "phone-call":
    "You are a receptionist at a doctor's office. The user is calling to schedule an appointment. Be natural, ask relevant questions (name, preferred date/time, reason for visit). Be patient and kind.",
  "job-interview":
    "You are a friendly but professional hiring manager conducting a job interview. Ask common interview questions one at a time. Be encouraging. The user is practicing speaking fluently during interviews.",
  "ordering-food":
    "You are a barista/waiter at a coffee shop. Take the user's order naturally. Ask about size, additions, name for the order. Be casual and friendly.",
  "class-presentation":
    "You are a supportive audience member at a presentation. The user will present a topic. Ask a question or two after they finish. Be encouraging.",
  "small-talk":
    "You are at a casual social gathering. Start a light conversation with the user. Topics: weather, weekend plans, hobbies, movies. Be warm and easygoing.",
  shopping:
    "You are a store employee. The user wants to return an item or ask about a product. Be helpful but ask for details like receipt, reason for return, etc.",
  "asking-directions":
    "You are a friendly stranger. The user is asking for directions to a place. Give clear but conversational directions. Ask if they need clarification.",
  "customer-service":
    "You are a customer service representative on a phone call. Help the user resolve an issue with their account/order. Ask for details, be professional.",
  "meeting-intro":
    "You are at a professional meeting. The user is introducing themselves. React naturally, ask a follow-up question about their role or background.",
};

/**
 * AI Conversation Cloud Function
 *
 * Proxies conversation requests to Claude API (Sonnet 4.5).
 * Called from iOS app via Firebase Functions SDK.
 */
export const aiConversation = onCall(
  { maxInstances: 10, memory: "256MiB" },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be signed in.");
    }

    const { scenario, messages, userMessage } = request.data;

    if (!scenario || !userMessage) {
      throw new HttpsError(
        "invalid-argument",
        "Missing scenario or userMessage."
      );
    }

    const apiKey = anthropicApiKey.value();
    if (!apiKey) {
      throw new HttpsError(
        "unavailable",
        "AI service not configured. Set ANTHROPIC_API_KEY."
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are helping someone who stutters practice real-world speaking scenarios. ${
      SCENARIO_PROMPTS[scenario] ||
      "You are a friendly conversation partner. Have a natural conversation with the user."
    }

IMPORTANT RULES:
- Keep responses SHORT (1-3 sentences). This is a conversation, not a monologue.
- Be patient, warm, and natural. Never mention or react to stuttering.
- Stay in character. Don't break the fourth wall.
- Ask one question at a time to keep the conversation flowing.
- Match the user's energy and pace.`;

    // Build conversation history
    const conversationHistory = (messages || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    );

    conversationHistory.push({ role: "user" as const, content: userMessage });

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 256,
        system: systemPrompt,
        messages: conversationHistory,
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      return { message: assistantMessage };
    } catch (error) {
      console.error("Claude API error:", error);
      throw new HttpsError("internal", "Failed to generate response.");
    }
  }
);
