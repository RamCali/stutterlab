"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function XaiTestPage() {
  const [message, setMessage] = useState(
    "Hi, I was wondering if you're hiring. I'm in-in-interested in the barista position."
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendTest() {
    const userMessage = message.trim();
    if (!userMessage) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/xai-phone-practice/text-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, messages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Test failed");
      }

      const assistantMessage = data.message || "";
      setMessages((current) => [
        ...current,
        { role: "user", content: userMessage },
        { role: "assistant", content: assistantMessage },
      ]);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center p-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">xAI Phone Practice Test</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This checks the text-only Sarah/The Daily Grind flow with memory.
            </p>
          </div>

          {messages.length > 0 && (
            <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border border-border bg-background/60 p-3">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`rounded-md p-3 text-sm ${
                    item.role === "user" ? "bg-primary/10" : "bg-muted/50"
                  }`}
                >
                  <p className="font-medium">
                    {item.role === "user" ? "You" : "Sarah"}
                  </p>
                  <p className="mt-1">{item.content}</p>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your next line in the call..."
            className="min-h-28 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={sendTest} disabled={loading || !message.trim()}>
              {loading ? "Testing..." : "Send test message"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMessages([]);
                setMessage(
                  "Hi, I was wondering if you're hiring. I'm in-in-interested in the barista position."
                );
                setError("");
              }}
            >
              Reset test call
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
