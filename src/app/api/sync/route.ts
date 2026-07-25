import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma-client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const store = searchParams.get("store");

    if (!store) {
      return NextResponse.json({ error: "store query param is required" }, { status: 400 });
    }

    const records = await db.syncRecord.findMany({
      where: { userId: session.user.id, storeName: store },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[sync GET]", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { action, store, records } = body;

    if (!action || !store) {
      return NextResponse.json({ error: "action and store are required" }, { status: 400 });
    }

    const userId = session.user.id;

    if (action === "push") {
      if (!Array.isArray(records)) {
        return NextResponse.json({ error: "records must be an array" }, { status: 400 });
      }

      let synced = 0;
      for (const record of records) {
        if (!record.id) continue;

        await db.syncRecord.upsert({
          where: {
            userId_storeName_recordId: {
              userId,
              storeName: store,
              recordId: record.id,
            },
          },
          create: {
            userId,
            storeName: store,
            recordId: record.id,
            data: JSON.stringify(record),
          },
          update: {
            data: JSON.stringify(record),
          },
        });
        synced++;
      }

      return NextResponse.json({ success: true, synced });
    }

    if (action === "pull") {
      const serverRecords = await db.syncRecord.findMany({
        where: { userId, storeName: store },
        orderBy: { updatedAt: "desc" },
      });

      const parsed = serverRecords
        .map((r) => {
          try {
            return JSON.parse(r.data);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      return NextResponse.json({ records: parsed });
    }

    return NextResponse.json({ error: "Invalid action. Use 'push' or 'pull'" }, { status: 400 });
  } catch (error) {
    console.error("[sync POST]", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const store = searchParams.get("store");
    const recordId = searchParams.get("recordId");

    if (!store || !recordId) {
      return NextResponse.json({ error: "store and recordId query params are required" }, { status: 400 });
    }

    await db.syncRecord.deleteMany({
      where: {
        userId: session.user.id,
        storeName: store,
        recordId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sync DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
