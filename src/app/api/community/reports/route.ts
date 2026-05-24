import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { communityReports } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/helpers";
import { requireCommunityAccess } from "@/lib/community/access";
import { checkRateLimit } from "@/lib/security/rate-limit";

const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "profile", "room"]),
  targetId: z.string().min(1).max(120),
  reason: z.enum(["spam", "unsafe_advice", "harassment", "privacy", "other"]),
  details: z.string().trim().max(500).optional(),
});

async function isCommunityAdmin() {
  const session = await getSession();
  const adminEmails = (process.env.COMMUNITY_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = session?.user?.email?.toLowerCase();
  return !!email && adminEmails.includes(email);
}

export async function GET() {
  try {
    if (!(await isCommunityAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await db
      .select()
      .from(communityReports)
      .where(eq(communityReports.status, "open"))
      .orderBy(desc(communityReports.createdAt))
      .limit(100);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Community reports GET error:", error);
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const rate = checkRateLimit(`community-report:${access.userId}`, 20, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = reportSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    }

    const [report] = await db
      .insert(communityReports)
      .values({
        reporterUserId: access.userId,
        ...parsed.data,
      })
      .returning();

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Community reports POST error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
