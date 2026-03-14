import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require the passcode
const PUBLIC_PATHS = [
  "/",
  "/access",
  "/api/access",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
];

// Prefixes that are always public
const PUBLIC_PREFIXES = [
  "/_next",
  "/logo",
  "/favicon",
  "/api/webhooks",
  "/api/stripe/webhook",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip if no passcode is configured (feature disabled)
  if (!process.env.EARLY_ACCESS_PASSCODE) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js|woff2?|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // Check for access cookie
  const accessCookie = req.cookies.get("stutterlab_access");
  if (accessCookie?.value === "granted") {
    return NextResponse.next();
  }

  // Redirect to access page
  const accessUrl = new URL("/access", req.url);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
