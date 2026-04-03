import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const now = new Date().toISOString();

  await db
    .update(platforms)
    .set({
      credentialsEncrypted: null,
      credentialsIv: null,
      credentialsTag: null,
      isConnected: false,
      lastVerifiedAt: null,
      updatedAt: now,
    })
    .where(eq(platforms.id, platform));

  return NextResponse.json({ success: true });
}
