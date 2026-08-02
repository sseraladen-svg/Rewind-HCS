import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, birthYear: true, eraSkin: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[user/profile]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { birthYear, eraSkin, name } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof birthYear === "number") updateData.birthYear = birthYear;
    if (typeof eraSkin === "string") updateData.eraSkin = eraSkin;
    if (typeof name === "string") updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { id: true, email: true, name: true, birthYear: true, eraSkin: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[user/profile]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}