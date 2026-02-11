import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { jwtVerify } from "jose";
import { authOptions } from "./config";

/**
 * Get the current session from cookies (web) or Bearer token (mobile).
 * Bearer token takes priority if present.
 */
export async function getSession() {
  const mobileUserId = await getMobileUserId();
  if (mobileUserId) {
    return {
      user: { id: mobileUserId },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/** Extract user ID from a mobile Bearer token */
async function getMobileUserId(): Promise<string | null> {
  try {
    const headersList = await headers();
    const auth = headersList.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;

    const token = auth.slice(7);
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    const encoded = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, encoded);

    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
