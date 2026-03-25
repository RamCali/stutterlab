import { NextResponse } from "next/server";

// Early access gate disabled — all pages are public.
// To re-enable, set EARLY_ACCESS_PASSCODE env var and restore the gate logic.

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
