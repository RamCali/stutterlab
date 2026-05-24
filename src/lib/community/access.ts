import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/helpers";
import { isPremium } from "@/lib/auth/premium";

export async function requireCommunityAccess(): Promise<
  { userId: string; error?: never } | { userId?: never; error: NextResponse }
> {
  const userId = await getUserId();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!(await isPremium(userId))) {
    return {
      error: NextResponse.json({ error: "Premium required" }, { status: 403 }),
    };
  }

  return { userId };
}
