import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { buildSlpSharePack } from "@/lib/slp/build-share-pack";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pack = await buildSlpSharePack(session.user.id);
  return NextResponse.json(pack);
}
