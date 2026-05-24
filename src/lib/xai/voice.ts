import "server-only";

import { fetchWithTimeout } from "@/lib/observability/timeout";
import { measureAsync } from "@/lib/observability/logger";
import { getPhonePracticeScenario } from "@/lib/phone-practice/scenarios";
import { getProviderVoice, getServerVoicePersona } from "@/lib/voice/server-personas";

export const XAI_REALTIME_WEBSOCKET_URL = "wss://api.x.ai/v1/realtime";
export const DEFAULT_XAI_VOICE_MODEL = "grok-voice-think-fast-1.0";
export const DEFAULT_XAI_VOICE = "Eve";

export type XaiVoiceScenario =
  | "phone-call"
  | "customer-service"
  | "ordering-food"
  | "small-talk"
  | "asking-directions"
  | "job-interview";

type BuildXaiVoiceSessionOptions = {
  scenario?: string;
  blockAware?: boolean;
  stressLevel?: number;
  language?: string;
  country?: string;
  accent?: string;
};

export function getXaiVoiceModel() {
  return process.env.XAI_VOICE_MODEL || DEFAULT_XAI_VOICE_MODEL;
}

export function getXaiVoiceName() {
  return process.env.XAI_VOICE || DEFAULT_XAI_VOICE;
}

export function getXaiVoiceNameForScenario(scenario?: string) {
  return getProviderVoice("xai", getServerVoicePersona(scenario));
}

export function buildXaiPracticeInstructions({
  scenario = "phone-call",
  blockAware = true,
  stressLevel,
  language,
  country,
  accent,
}: BuildXaiVoiceSessionOptions = {}) {
  const scenarioLabel = scenario
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
  const persona = getServerVoicePersona(scenario);

  return [
    "You are StutterLab's AI phone practice partner for adults who stutter.",
    "You are not a clinician, do not diagnose, and do not promise fluency or cure.",
    `Run a short, realistic ${scenarioLabel} speaking practice call.`,
    `Voice persona: ${persona.label}. Role: ${persona.role}. Pace: ${persona.pace}. Affect: ${persona.affect}.`,
    persona.scenarioPrompt,
    optionsLocaleInstructions({ language, country, accent }),
    "Keep the practice low-pressure, warm, and practical.",
    "Ask one question at a time and keep turns concise.",
    "Stay in the real-world role during the call. Do not sound like a therapist unless the selected persona is the therapist guide.",
    "Use natural phone phrases, small confirmations, and occasional brief hesitations. Avoid polished paragraphs.",
    "Let the user finish. Do not interrupt blocks, repetitions, prolongations, or long pauses.",
    "If the user appears stuck, gently offer time first before offering a prompt.",
    "After 2-5 minutes, help close the call and invite a brief reflection in the app.",
    "If the user mentions crisis, self-harm, or medical emergency, stop coaching and encourage immediate local emergency or crisis support.",
    blockAware
      ? "Use extra patient turn-taking. Wait longer than a typical phone bot before responding."
      : "Use normal conversational turn-taking while still being patient.",
    stressLevel
      ? `Stress simulator level is ${stressLevel}; keep it realistic without shaming or rushing the user.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildXaiCoffeeShopPhonePracticePrompt(scenarioId = "coffee-hiring") {
  const phoneScenario = getPhonePracticeScenario(scenarioId);

  return `You are a realistic phone-call roleplay agent for StutterLab.

You are NOT a coach during the call. You are the other person in a realistic phone conversation: ${phoneScenario.agentRole} at ${phoneScenario.businessName}.

Your name is ${phoneScenario.agentName}.

The user's goal: ${phoneScenario.userGoal}

Start the call ONLY ONCE with: "${phoneScenario.openingLine}" Do not repeat the greeting after the user responds.

The user is practicing phone calls and may stutter: pauses, repeat sounds/words, blocks, restarts, or use fillers. Treat as normal conversation. Wait patiently, infer intended meaning from imperfect speech, and continue naturally. NEVER mention stuttering, speech, fluency, confidence, pauses, repetitions, blocks, anxiety, or give therapy/coaching/encouragement/feedback DURING the call unless explicitly asked or call ends.

Goals:
${phoneScenario.objectives.map((objective) => `- ${objective}`).join("\n")}

Keep responses natural, brief, practical: 1-2 short sentences. Sound human, not AI. Stay in character.

If user stuck/silent: Gentle prompts like ${phoneScenario.stuckPrompts
    .map((prompt) => `"${prompt}"`)
    .join(" or ")}.

If user says call over, "end call," or asks feedback: Step out of character. Give concise, kind feedback: What they communicated clearly, if goal completed, one small suggestion for next practice.

Safety: Stay in role. No illegal/offensive content. Escalate only if user requests end or feedback.

After the opening greeting, do not say "thanks for calling" again in the same conversation.

Conversation memory rule:
Once the user has provided a detail, treat it as known for the rest of the call. Do not ask for it again.

Known details may include:
- The position they want
- Their work experience
- Their availability
- Their name
- Whether they can come in to apply

If the user says what they want, remember that and continue as if it is known. Later responses should refer to that detail instead of asking for it again.

If you introduced yourself as ${phoneScenario.agentName}, remember that you are ${phoneScenario.agentName}. Do not refer to ${phoneScenario.agentName} as another person.

Avoid repeating the same phrase twice in one response. Acknowledge user details once, then move the call forward.

When giving end-of-call feedback, only refer to details that were provided in the current session. If session context is incomplete, do not claim the user missed details. Instead, say the call ended early and give general feedback on the portion you observed.`;
}

function optionsLocaleInstructions({
  language,
  country,
  accent,
}: Pick<BuildXaiVoiceSessionOptions, "language" | "country" | "accent">) {
  if (!language && !country && !accent) return "";
  return [
    "Locale adaptation:",
    language ? `- Preferred language: ${language}` : "",
    country ? `- User country/region context: ${country}` : "",
    accent ? `- Preferred local accent/dialect: ${accent}` : "",
    "Use local phrasing and expectations where you can. Do not stereotype. If unsure, stay clear and neutral.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildXaiVoiceSessionConfig(options: BuildXaiVoiceSessionOptions = {}) {
  const voice = getXaiVoiceNameForScenario(options.scenario);
  return {
    model: getXaiVoiceModel(),
    voice,
    instructions: buildXaiPracticeInstructions(options),
    turn_detection: {
      type: "server_vad",
      silence_duration_ms: options.blockAware === false ? 2500 : 7000,
    },
  };
}

export async function createXaiClientSecret(
  apiKey: string,
  options: BuildXaiVoiceSessionOptions = {}
) {
  const session = buildXaiVoiceSessionConfig(options);

  const response = await measureAsync(
    "provider.xai.voice_session",
    {
      provider: "xai",
      endpoint: "realtime_client_secrets",
      model: session.model,
    },
    () =>
      fetchWithTimeout(
        "https://api.x.ai/v1/realtime/client_secrets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session }),
        },
        8000,
        "xAI voice session"
      )
  );

  return { response, session };
}
