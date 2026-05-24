import { db } from "@/lib/db/client";
import { communityMemberProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALIAS_ADJECTIVES = ["Steady", "Brave", "Calm", "Bright", "Grounded", "Clear"];
const ALIAS_NOUNS = ["Speaker", "Voice", "Path", "Step", "Practice", "Anchor"];
const AVATAR_COLORS = ["teal", "blue", "emerald", "amber", "violet", "rose"];

export function makeCommunityAlias(userId: string) {
  const seed = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const adjective = ALIAS_ADJECTIVES[seed % ALIAS_ADJECTIVES.length];
  const noun = ALIAS_NOUNS[(seed * 3) % ALIAS_NOUNS.length];
  return `${adjective} ${noun} ${userId.slice(-3).toUpperCase()}`;
}

export async function getOrCreateCommunityProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(communityMemberProfiles)
    .where(eq(communityMemberProfiles.userId, userId))
    .limit(1);

  if (existing) return existing;

  const seed = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [profile] = await db
    .insert(communityMemberProfiles)
    .values({
      userId,
      alias: makeCommunityAlias(userId),
      avatarColor: AVATAR_COLORS[seed % AVATAR_COLORS.length],
    })
    .returning();

  return profile;
}
