import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify, createRemoteJWKSet } from "jose";
import { db } from "@/lib/db/client";
import { users, accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// Apple JWKS endpoint for verifying identity tokens
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

// Google token info endpoint
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

interface AuthRequest {
  provider: "apple" | "google" | "dev";
  identityToken: string;
  name?: string;
  email?: string;
}

interface ProviderUser {
  providerAccountId: string;
  email: string | null;
  name: string | null;
}

/**
 * POST /api/mobile/auth
 * Accepts Apple/Google identity tokens, creates or finds the user,
 * and returns a signed JWT for mobile Bearer auth.
 */
export async function POST(req: NextRequest) {
  try {
    const body: AuthRequest = await req.json();
    const { provider, identityToken, name } = body;

    if (!provider || !identityToken) {
      return NextResponse.json(
        { error: "Missing provider or identityToken" },
        { status: 400 }
      );
    }

    let providerUser: ProviderUser;

    if (provider === "dev") {
      // Dev login — only allowed in development
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Dev login not available in production" },
          { status: 403 }
        );
      }
      providerUser = {
        providerAccountId: `dev_${body.email ?? "tester@stutterlab.dev"}`,
        email: body.email ?? "tester@stutterlab.dev",
        name: name ?? "Dev Tester",
      };
    } else if (provider === "apple") {
      providerUser = await verifyAppleToken(identityToken, name);
    } else if (provider === "google") {
      providerUser = await verifyGoogleToken(identityToken);
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    // Find or create user in the database
    const user = await findOrCreateUser(provider, providerUser);

    // Sign a JWT with the same secret NextAuth uses
    const encoded = new TextEncoder().encode(NEXTAUTH_SECRET);
    const token = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(encoded);

    return NextResponse.json({
      token,
      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Mobile auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

async function verifyAppleToken(
  identityToken: string,
  providedName?: string
): Promise<ProviderUser> {
  const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
    issuer: "https://appleid.apple.com",
    audience: process.env.APPLE_BUNDLE_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
  });

  return {
    providerAccountId: payload.sub as string,
    email: (payload.email as string) ?? null,
    name: providedName ?? null,
  };
}

async function verifyGoogleToken(
  identityToken: string
): Promise<ProviderUser> {
  const res = await fetch(
    `${GOOGLE_TOKEN_INFO_URL}?id_token=${identityToken}`
  );

  if (!res.ok) {
    throw new Error("Invalid Google token");
  }

  const data = await res.json();

  if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience mismatch");
  }

  return {
    providerAccountId: data.sub,
    email: data.email ?? null,
    name: data.name ?? null,
  };
}

async function findOrCreateUser(
  provider: string,
  providerUser: ProviderUser
) {
  // Check if this provider account already exists
  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerUser.providerAccountId)
      )
    )
    .limit(1);

  if (existingAccount) {
    // Return the linked user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingAccount.userId))
      .limit(1);

    return user;
  }

  // Check if a user with this email already exists
  if (providerUser.email) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, providerUser.email))
      .limit(1);

    if (existingUser) {
      // Link this new provider to the existing user
      await db.insert(accounts).values({
        userId: existingUser.id,
        type: "oauth",
        provider,
        providerAccountId: providerUser.providerAccountId,
      });

      return existingUser;
    }
  }

  // Create a new user
  const [newUser] = await db
    .insert(users)
    .values({
      name: providerUser.name,
      email: providerUser.email,
    })
    .returning();

  // Link the provider account
  await db.insert(accounts).values({
    userId: newUser.id,
    type: "oauth",
    provider,
    providerAccountId: providerUser.providerAccountId,
  });

  return newUser;
}
