import { NextResponse } from "next/server";
import { JWT } from "google-auth-library";

export async function GET() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tab = process.env.GOOGLE_SHEETS_WAITLIST_TAB || "Waitlist";

  if (!clientEmail || !rawKey || !spreadsheetId) {
    return NextResponse.json({
      ok: false,
      step: "config",
      missing: {
        email: !clientEmail,
        key: !rawKey,
        spreadsheetId: !spreadsheetId,
      },
    });
  }

  const keyDiagnostics = {
    length: rawKey.length,
    hasLiteralBackslashN: rawKey.includes("\\n"),
    hasActualNewlines: rawKey.includes("\n"),
    startsCorrectly:
      rawKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
      rawKey.startsWith("-----BEGIN PRIVATE KEY-----\\n"),
    endsCorrectly:
      rawKey.endsWith("-----END PRIVATE KEY-----\n") ||
      rawKey.endsWith("-----END PRIVATE KEY-----\\n") ||
      rawKey.endsWith("-----END PRIVATE KEY-----"),
    first50: rawKey.slice(0, 50),
    last30: rawKey.slice(-30),
  };

  // Try both \n replacement variants
  const privateKey = rawKey.includes("\\n")
    ? rawKey.replace(/\\n/g, "\n")
    : rawKey;

  let token: string | null = null;
  try {
    const client = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const t = await client.getAccessToken();
    token = t.token ?? null;
  } catch (err) {
    return NextResponse.json({
      ok: false,
      step: "auth",
      error: String(err),
      keyDiagnostics,
    });
  }

  if (!token) {
    return NextResponse.json({ ok: false, step: "auth", error: "no token returned" });
  }

  const range = `${tab}!A:C`;
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append`
  );
  url.searchParams.set("valueInputOption", "USER_ENTERED");
  url.searchParams.set("insertDataOption", "INSERT_ROWS");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [["debug-test@example.com", "debug", new Date().toISOString()]],
    }),
  });

  const body = await res.text();

  return NextResponse.json({
    ok: res.ok,
    step: "append",
    status: res.status,
    tab,
    spreadsheetId,
    response: body,
  });
}
