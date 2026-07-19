import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma-client";

// Push local journal entries to server (cloud sync)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { entries } = await req.json();
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "entries must be an array" }, { status: 400 });
    }

    const userId = session.user.id as string;
    let synced = 0;

    for (const entry of entries) {
      if (!entry.id || !entry.content) continue;

      await db.journalSync.upsert({
        where: { userId_entryId: { userId, entryId: entry.id } },
        create: {
          userId,
          entryId: entry.id,
          content: entry.content,
          mood: entry.mood || null,
          weather: entry.weather || null,
        },
        update: {
          content: entry.content,
          mood: entry.mood || null,
          weather: entry.weather || null,
        },
      });
      synced++;
    }

    return NextResponse.json({ success: true, synced });
  } catch (error) {
    console.error("[sync/push]", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Pull server journal entries to local (cloud sync)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const entries = await db.journalSync.findMany({
      where: { userId: session.user.id as string },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[sync/pull]", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}