import "server-only";

import {
  getTherapistVoicePersona,
  getVoicePersonaForScenario,
  type VoicePersona,
} from "@/lib/voice/personas";

export type VoiceProvider = "xai" | "openai" | "elevenLabsTts";

const PROVIDER_DEFAULTS: Record<VoiceProvider, string> = {
  xai: "alloy",
  openai: "marin",
  elevenLabsTts: "21m00Tcm4TlvDq8ikWAM",
};

const PROVIDER_GLOBAL_ENV: Record<VoiceProvider, string> = {
  xai: "XAI_VOICE",
  openai: "OPENAI_REALTIME_VOICE",
  elevenLabsTts: "ELEVENLABS_VOICE_ID",
};

export function getServerVoicePersona(scenario?: string, therapistMode = false) {
  return therapistMode
    ? getTherapistVoicePersona()
    : getVoicePersonaForScenario(scenario);
}

export function getProviderVoice(
  provider: VoiceProvider,
  persona: VoicePersona
) {
  const personaEnv = persona.providerVoiceEnv[provider];
  const personaVoice = personaEnv ? process.env[personaEnv] : undefined;
  const globalVoice = process.env[PROVIDER_GLOBAL_ENV[provider]];
  return personaVoice || globalVoice || PROVIDER_DEFAULTS[provider];
}

export function getVoiceMetadata(scenario?: string, therapistMode = false) {
  const persona = getServerVoicePersona(scenario, therapistMode);
  return {
    persona,
    voices: {
      xai: getProviderVoice("xai", persona),
      openai: getProviderVoice("openai", persona),
      elevenLabsTts: getProviderVoice("elevenLabsTts", persona),
    },
  };
}
