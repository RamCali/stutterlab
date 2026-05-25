import "server-only";

import { JWT } from "google-auth-library";
import { logError } from "@/lib/observability/logger";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function getSheetsConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  return { clientEmail, privateKey, spreadsheetId };
}

async function getAccessToken(): Promise<string | null> {
  const config = getSheetsConfig();
  if (!config) return null;

  const client = new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [SHEETS_SCOPE],
  });

  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token ?? null;
}

/** Append a waitlist signup row: Email | Source | Signed up (ISO). */
export async function appendWaitlistToGoogleSheet(
  email: string,
  source: string
): Promise<void> {
  const config = getSheetsConfig();
  if (!config) return;

  try {
    const token = await getAccessToken();
    if (!token) {
      logError("provider.google_sheets.waitlist.no_token");
      return;
    }

    const tab = process.env.GOOGLE_SHEETS_WAITLIST_TAB || "Waitlist";
    const range = `${tab}!A:C`;
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(range)}:append`
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
        values: [[email, source, new Date().toISOString()]],
      }),
    });

    if (!res.ok) {
      logError("provider.google_sheets.waitlist.bad_status", undefined, {
        status: res.status,
      });
    }
  } catch (err) {
    logError("provider.google_sheets.waitlist.error", err);
  }
}
