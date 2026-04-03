import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import { encrypt } from "@/lib/crypto";
import { platformRegistry } from "@/lib/platforms/registry";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const adapter = platformRegistry[platform];

  if (!adapter) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  if (adapter.authType === "manual") {
    // Manual platforms are always "connected"
    const now = new Date().toISOString();
    await db
      .update(platforms)
      .set({ isConnected: true, updatedAt: now })
      .where(eq(platforms.id, platform));
    return NextResponse.json({ success: true });
  }

  const credentials = await req.json();

  // Verify before saving
  const verifyResult = await adapter.verify(credentials);
  if (!verifyResult.success) {
    return NextResponse.json(
      { error: verifyResult.error || "Verification failed" },
      { status: 400 }
    );
  }

  // Encrypt and store
  const { ciphertext, iv, tag } = encrypt(JSON.stringify(credentials));
  const now = new Date().toISOString();

  await db
    .update(platforms)
    .set({
      credentialsEncrypted: ciphertext,
      credentialsIv: iv,
      credentialsTag: tag,
      isConnected: true,
      lastVerifiedAt: now,
      updatedAt: now,
    })
    .where(eq(platforms.id, platform));

  return NextResponse.json({
    success: true,
    username: verifyResult.username,
  });
}
