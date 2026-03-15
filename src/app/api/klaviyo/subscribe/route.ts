import { NextRequest, NextResponse } from "next/server";

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      return NextResponse.json({ success: true });
    }

    // Klaviyo Server API — bulk subscribe (creates profile + subscribes + consent)
    const res = await fetch(
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          "Content-Type": "application/json",
          revision: "2024-10-15",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              custom_source: source || "website",
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
                  id: KLAVIYO_LIST_ID,
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Klaviyo subscribe failed:", res.status, await res.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Klaviyo subscribe error:", err);
    return NextResponse.json({ success: true });
  }
}
