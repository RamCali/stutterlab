import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { communityPostReactions, communityPosts } from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;
    const { postId } = await params;

    const [existing] = await db
      .select()
      .from(communityPostReactions)
      .where(
        and(
          eq(communityPostReactions.postId, postId),
          eq(communityPostReactions.userId, access.userId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .delete(communityPostReactions)
        .where(eq(communityPostReactions.id, existing.id));
      await db
        .update(communityPosts)
        .set({ upvotes: sql`greatest(${communityPosts.upvotes} - 1, 0)` })
        .where(eq(communityPosts.id, postId));
      return NextResponse.json({ reacted: false });
    }

    await db.insert(communityPostReactions).values({
      postId,
      userId: access.userId,
    });
    await db
      .update(communityPosts)
      .set({ upvotes: sql`${communityPosts.upvotes} + 1` })
      .where(eq(communityPosts.id, postId));

    return NextResponse.json({ reacted: true });
  } catch (error) {
    console.error("Community reaction error:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
