import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { communityMemberProfiles } from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";
import { getOrCreateCommunityProfile } from "@/lib/community/profile";

const profileSchema = z.object({
  alias: z.string().trim().min(3).max(40),
  bio: z.string().trim().max(180).optional(),
  avatarColor: z.enum(["teal", "blue", "emerald", "amber", "violet", "rose"]),
  showRealName: z.boolean().default(false),
});

export async function GET() {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const profile = await getOrCreateCommunityProfile(access.userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Community profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }

    const [profile] = await db
      .update(communityMemberProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(communityMemberProfiles.userId, access.userId))
      .returning();

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Community profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
