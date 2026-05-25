/**
 * One-time backfill: copy all early_access_signups from the DB into Google Sheets.
 *
 * Usage (from repo root, with .env loaded):
 *   node --env-file=.env scripts/sync-waitlist-to-google-sheet.mjs
 */

import { neon } from "@neondatabase/serverless";
import { JWT } from "google-auth-library";

const databaseUrl = process.env.DATABASE_URL;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const tab = process.env.GOOGLE_SHEETS_WAITLIST_TAB || "Waitlist";

if (!databaseUrl || !clientEmail || !privateKey || !spreadsheetId) {
  console.error(
    "Missing DATABASE_URL, GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
  );
  process.exit(1);
}

const sql = neon(databaseUrl);
const rows = await sql`
  SELECT email, created_at
  FROM early_access_signups
  ORDER BY created_at ASC
`;

if (rows.length === 0) {
  console.log("No waitlist signups in the database.");
  process.exit(0);
}

const client = new JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const { token } = await client.getAccessToken();
if (!token) {
  console.error("Failed to obtain Google access token");
  process.exit(1);
}

const range = `${tab}!A:C`;
const url = new URL(
  `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append`
);
url.searchParams.set("valueInputOption", "USER_ENTERED");
url.searchParams.set("insertDataOption", "INSERT_ROWS");

let appended = 0;
for (const row of rows) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [
        [
          row.email,
          "backfill",
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : String(row.created_at),
        ],
      ],
    }),
  });
  if (!res.ok) {
    console.error(`Failed for ${row.email}:`, res.status, await res.text());
    process.exit(1);
  }
  appended += 1;
}

console.log(`Appended ${appended} row(s) to sheet tab "${tab}".`);
