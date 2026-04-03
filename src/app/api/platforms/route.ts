import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import { platformRegistry, platformOrder } from "@/lib/platforms/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(platforms);

  const mapped = platformOrder.map((id) => {
    const row = rows.find((r) => r.id === id);
    const adapter = platformRegistry[id];
    return {
      id,
      name: adapter?.name ?? id,
      isConnected: row?.isConnected ?? false,
      lastVerifiedAt: row?.lastVerifiedAt ?? null,
      authType: adapter?.authType ?? "manual",
      maxLength: adapter?.maxLength ?? null,
      credentialFields: adapter?.credentialFields ?? [],
    };
  });

  return NextResponse.json(mapped);
}
