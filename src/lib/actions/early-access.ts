"use server";

import { db } from "@/lib/db/client";
import { earlyAccessSignups } from "@/lib/db/schema";

async function syncToKlaviyo(email: string, source: string) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) return;

  try {
    // Klaviyo Server API — Subscribe profiles to a list in one call
    // Creates the profile if needed + subscribes to the list + sets consent
    const res = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          "Content-Type": "application/json",
          revision: "2024-10-15",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              custom_source: source,
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: {
                      email,
                      subscriptions: {
                        email: {
                          marketing: {
                            consent: "SUBSCRIBED",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: listId,
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error(
        "Klaviyo subscribe failed:",
        res.status,
        await res.text()
      );
    }
  } catch (err) {
    console.error("Klaviyo sync error:", err);
  }
}

export async function joinEarlyAccess(email: string, source = "early-access") {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    await db
      .insert(earlyAccessSignups)
      .values({ email: trimmed })
      .onConflictDoNothing();

    await syncToKlaviyo(trimmed, source);

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
