import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/helpers";
import { buildResearchExportCsvForUser } from "@/lib/research/build-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      {
        error:
          "Sign in to export. Use Settings → Privacy & Data → Export research CSV while logged in.",
      },
      { status: 401 },
    );
  }

  const result = await buildResearchExportCsvForUser(userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
