import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platforms, posts, postResults } from "@/lib/db/schema";
import { decrypt } from "@/lib/crypto";
import { platformRegistry } from "@/lib/platforms/registry";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { content, platformIds } = await req.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Get all connected platforms
  const allPlatforms = await db.select().from(platforms);
  const connected = allPlatforms.filter((p) => {
    if (!p.isConnected) return false;
    if (platformIds && platformIds.length > 0) {
      return platformIds.includes(p.id);
    }
    return true;
  });

  if (connected.length === 0) {
    return NextResponse.json(
      { error: "No platforms connected" },
      { status: 400 }
    );
  }

  // Create post record
  const postId = uuid();
  const now = new Date().toISOString();
  await db.insert(posts).values({
    id: postId,
    content: content.trim(),
    createdAt: now,
  });

  // Post to all platforms concurrently
  const results = await Promise.allSettled(
    connected.map(async (platform) => {
      const adapter = platformRegistry[platform.id];
      if (!adapter) {
        return {
          platformId: platform.id,
          status: "failure" as const,
          error: "No adapter found",
        };
      }

      // Get credentials for non-manual platforms
      let credentials: Record<string, string> = {};
      if (
        adapter.authType !== "manual" &&
        platform.credentialsEncrypted &&
        platform.credentialsIv &&
        platform.credentialsTag
      ) {
        credentials = JSON.parse(
          decrypt(
            platform.credentialsEncrypted,
            platform.credentialsIv,
            platform.credentialsTag
          )
        );
      }

      const result = await adapter.post(content.trim(), credentials);

      return {
        platformId: platform.id,
        status: result.manualUrl
          ? ("manual" as const)
          : result.success
            ? ("success" as const)
            : ("failure" as const),
        externalId: result.externalId,
        externalUrl: result.externalUrl || result.manualUrl,
        error: result.error,
      };
    })
  );

  // Save results
  const resultData = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return r.value;
    }
    return {
      platformId: connected[i].id,
      status: "failure" as const,
      error: (r.reason as Error).message,
    };
  });

  for (const r of resultData) {
    await db.insert(postResults).values({
      id: uuid(),
      postId,
      platformId: r.platformId,
      status: r.status,
      externalId: r.externalId || null,
      externalUrl: r.externalUrl || null,
      errorMessage: r.error || null,
      createdAt: now,
    });
  }

  return NextResponse.json({
    postId,
    results: resultData,
  });
}
