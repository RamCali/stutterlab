import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PHONE_BRIDGE_PORT || 8787);
const BRIDGE_TOKEN = process.env.PHONE_PRACTICE_BRIDGE_TOKEN || "";
const XAI_API_KEY = process.env.XAI_API_KEY || "";
const XAI_REALTIME_MODEL =
  process.env.XAI_VOICE_MODEL || "grok-voice-think-fast-1.0";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "stutterlab-phone-bridge" }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (twilioSocket, request) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const token = url.searchParams.get("token") || "";

  if (BRIDGE_TOKEN && token !== BRIDGE_TOKEN) {
    twilioSocket.close(1008, "Invalid bridge token");
    return;
  }

  const scenario = url.searchParams.get("scenario") || "phone-call";
  const xaiVoice = url.searchParams.get("xaiVoice") || "Eve";
  let streamSid = "";
  let xaiSocket;

  console.log("[bridge] Twilio stream connected", { scenario, xaiVoice });

  if (XAI_API_KEY) {
    xaiSocket = new WebSocket(
      `wss://api.x.ai/v1/realtime?model=${encodeURIComponent(XAI_REALTIME_MODEL)}`,
      {
        headers: { Authorization: `Bearer ${XAI_API_KEY}` },
      }
    );

    xaiSocket.on("open", () => {
      console.log("[bridge] xAI realtime connected");
      xaiSocket.send(
        JSON.stringify({
          type: "session.update",
          session: {
            voice: xaiVoice,
            instructions:
              "You are a realistic StutterLab phone practice agent. Stay in the caller's selected scenario, respond briefly, and never mention stuttering during the call.",
            turn_detection: {
              type: "server_vad",
              threshold: 0.75,
              silence_duration_ms: 1200,
            },
            audio: {
              input: { format: { type: "audio/pcmu", rate: 8000 } },
              output: { format: { type: "audio/pcmu", rate: 8000 } },
            },
          },
        })
      );
    });

    xaiSocket.on("message", (raw) => {
      const event = safeJson(raw.toString());
      if (!event || !streamSid) return;

      if (event.type === "response.output_audio.delta" && event.delta) {
        twilioSocket.send(
          JSON.stringify({
            event: "media",
            streamSid,
            media: { payload: event.delta },
          })
        );
      }
    });

    xaiSocket.on("error", (error) => {
      console.error("[bridge] xAI websocket error", error.message);
    });
  } else {
    console.warn("[bridge] XAI_API_KEY missing; Twilio stream will be accepted only.");
  }

  twilioSocket.on("message", (raw) => {
    const event = safeJson(raw.toString());
    if (!event) return;

    if (event.event === "start") {
      streamSid = event.start?.streamSid || "";
      console.log("[bridge] Twilio stream started", { streamSid });
      return;
    }

    if (event.event === "media" && event.media?.payload && xaiSocket?.readyState === WebSocket.OPEN) {
      xaiSocket.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: event.media.payload,
        })
      );
      return;
    }

    if (event.event === "stop") {
      console.log("[bridge] Twilio stream stopped", { streamSid });
      xaiSocket?.close();
    }
  });

  twilioSocket.on("close", () => {
    console.log("[bridge] Twilio stream disconnected", { streamSid });
    xaiSocket?.close();
  });
});

server.listen(PORT, () => {
  console.log(`[bridge] listening on :${PORT}`);
  console.log("[bridge] expose this with a wss:// URL for PHONE_PRACTICE_BRIDGE_WS_URL");
});

function safeJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
