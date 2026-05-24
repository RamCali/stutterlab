import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  communityComments,
  communityMemberProfiles,
  communityPosts,
} from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";
import { getOrCreateCommunityProfile } from "@/lib/community/profile";
import { checkRateLimit } from "@/lib/security/rate-limit";

const commentSchema = z.object({
  content: z.string().trim().min(2).max(800),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;
    const { postId } = await params;

    const comments = await db
      .select({
        id: communityComments.id,
        content: communityComments.content,
        createdAt: communityComments.createdAt,
        author: sql<string>`coalesce(${communityMemberProfiles.alias}, concat('Member ', right(${communityComments.userId}, 4)))`,
      })
      .from(communityComments)
      .leftJoin(
        communityMemberProfiles,
        eq(communityComments.userId, communityMemberProfiles.userId)
      )
      .where(eq(communityComments.postId, postId))
      .orderBy(desc(communityComments.createdAt))
      .limit(50);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Community comments GET error:", error);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;
    const { userId } = access;
    const { postId } = await params;

    const rate = checkRateLimit(`community-comment:${userId}`, 30, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many comments. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = commentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const profile = await getOrCreateCommunityProfile(userId);
    const [comment] = await db
      .insert(communityComments)
      .values({
        postId,
        userId,
        content: parsed.data.content,
      })
      .returning();

    await db
      .update(communityPosts)
      .set({
        commentCount: sql`${communityPosts.commentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(communityPosts.id, postId)));

    return NextResponse.json({
      comment: { ...comment, author: profile.alias },
    });
  } catch (error) {
    console.error("Community comments POST error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
