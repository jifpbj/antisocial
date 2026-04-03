import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import { decrypt } from "@/lib/crypto";
import { platformRegistry } from "@/lib/platforms/registry";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const adapter = platformRegistry[platform];

  if (!adapter) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  if (adapter.authType === "manual") {
    return NextResponse.json({ success: true, username: "Manual" });
  }

  // Get stored credentials
  const [row] = await db
    .select()
    .from(platforms)
    .where(eq(platforms.id, platform));

  if (
    !row ||
    !row.credentialsEncrypted ||
    !row.credentialsIv ||
    !row.credentialsTag
  ) {
    return NextResponse.json(
      { error: "No credentials stored" },
      { status: 400 }
    );
  }

  const credentials = JSON.parse(
    decrypt(row.credentialsEncrypted, row.credentialsIv, row.credentialsTag)
  );

  const result = await adapter.verify(credentials);
  const now = new Date().toISOString();

  if (result.success) {
    await db
      .update(platforms)
      .set({ lastVerifiedAt: now, isConnected: true, updatedAt: now })
      .where(eq(platforms.id, platform));
  } else {
    await db
      .update(platforms)
      .set({ isConnected: false, updatedAt: now })
      .where(eq(platforms.id, platform));
  }

  return NextResponse.json(result);
}
