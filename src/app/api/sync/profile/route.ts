import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let profile = await db.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await db.userProfile.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json({
      birthYear: profile.birthYear,
      eraSkin: profile.eraSkin,
      onboardingComplete: profile.onboardingComplete,
    });
  } catch (error) {
    console.error("[sync/profile GET]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { birthYear, eraSkin, onboardingComplete } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof birthYear === "number") updateData.birthYear = birthYear;
    if (typeof eraSkin === "string") updateData.eraSkin = eraSkin;
    if (typeof onboardingComplete === "boolean") updateData.onboardingComplete = onboardingComplete;

    const profile = await db.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      birthYear: profile.birthYear,
      eraSkin: profile.eraSkin,
      onboardingComplete: profile.onboardingComplete,
    });
  } catch (error) {
    console.error("[sync/profile PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
