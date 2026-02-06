"use server";

import { db } from "@/lib/db/client";
import { communityPosts, communityComments, profiles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getCommunityPosts(category?: string) {
  const user = await requireAuth();

  const conditions = category
    ? eq(communityPosts.category, category)
    : undefined;

  return db
    .select()
    .from(communityPosts)
    .where(conditions)
    .orderBy(desc(communityPosts.createdAt))
    .limit(50);
}

export async function createPost(data: {
  category: string;
  title: string;
  content: string;
}) {
  const user = await requireAuth();

  const [post] = await db
    .insert(communityPosts)
    .values({
      userId: user.id,
      category: data.category,
      title: data.title.trim(),
      content: data.content.trim(),
    })
    .returning();

  return post;
}

export async function getPostComments(postId: string) {
  const user = await requireAuth();

  return db
    .select()
    .from(communityComments)
    .where(eq(communityComments.postId, postId))
    .orderBy(communityComments.createdAt);
}

export async function addComment(postId: string, content: string) {
  const user = await requireAuth();

  const [comment] = await db
    .insert(communityComments)
    .values({
      postId,
      userId: user.id,
      content: content.trim(),
    })
    .returning();

  // Increment comment count
  await db
    .update(communityPosts)
    .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
    .where(eq(communityPosts.id, postId));

  return comment;
}

export async function upvotePost(postId: string) {
  const user = await requireAuth();

  await db
    .update(communityPosts)
    .set({ upvotes: sql`${communityPosts.upvotes} + 1` })
    .where(eq(communityPosts.id, postId));

  return { success: true };
}

export async function getCategoryPostCounts() {
  const user = await requireAuth();

  const results = await db
    .select({
      category: communityPosts.category,
      count: sql<number>`count(*)::int`,
    })
    .from(communityPosts)
    .groupBy(communityPosts.category);

  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.category] = row.count;
  }
  return counts;
}
