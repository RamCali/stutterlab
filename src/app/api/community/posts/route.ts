import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  communityMemberProfiles,
  communityPostReactions,
  communityPosts,
} from "@/lib/db/schema";
import { requireCommunityAccess } from "@/lib/community/access";
import { getOrCreateCommunityProfile } from "@/lib/community/profile";
import { checkRateLimit } from "@/lib/security/rate-limit";

const postSchema = z.object({
  category: z.enum(["wins", "techniques", "support", "questions", "resources"]),
  title: z.string().trim().min(4).max(120),
  content: z.string().trim().min(10).max(1500),
});

export async function GET() {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;

    const posts = await db
      .select({
        id: communityPosts.id,
        category: communityPosts.category,
        title: communityPosts.title,
        content: communityPosts.content,
        upvotes: communityPosts.upvotes,
        commentCount: communityPosts.commentCount,
        createdAt: communityPosts.createdAt,
        author: sql<string>`coalesce(${communityMemberProfiles.alias}, concat('Member ', right(${communityPosts.userId}, 4)))`,
        reacted: sql<boolean>`exists(select 1 from ${communityPostReactions} where ${communityPostReactions.postId} = ${communityPosts.id} and ${communityPostReactions.userId} = ${access.userId})`,
      })
      .from(communityPosts)
      .leftJoin(
        communityMemberProfiles,
        eq(communityPosts.userId, communityMemberProfiles.userId)
      )
      .orderBy(desc(communityPosts.createdAt))
      .limit(50);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Community posts GET error:", error);
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await requireCommunityAccess();
    if (access.error) return access.error;
    const { userId } = access;

    const rate = checkRateLimit(`community-post:${userId}`, 8, 60 * 60 * 1000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many posts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = postSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid post" }, { status: 400 });
    }

    const profile = await getOrCreateCommunityProfile(userId);
    const [post] = await db
      .insert(communityPosts)
      .values({
        userId,
        category: parsed.data.category,
        title: parsed.data.title,
        content: parsed.data.content,
      })
      .returning();

    return NextResponse.json({
      post: {
        ...post,
        author: profile.alias,
        reacted: false,
      },
    });
  } catch (error) {
    console.error("Community posts POST error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
