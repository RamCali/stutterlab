import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getDailyPlan } from "@/lib/curriculum/daily-plans";
import { db } from "@/lib/db/client";
import { userStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, session.user.id))
    .limit(1);

  const day = stats?.currentDay ?? 1;
  const plan = getDailyPlan(day);

  const techniqueSummaries =
    plan?.tasks.slice(0, 4).map((t) => ({
      title: t.title,
      instructions: `${t.subtitle} (${t.duration})`,
    })) ?? [];

  return NextResponse.json({
    cachedAt: new Date().toISOString(),
    day,
    plan,
    techniqueSummaries,
  });
}
