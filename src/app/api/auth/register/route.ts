import { NextResponse } from "next/server";
import { db } from "@/lib/prisma-client";
import bcrypt from "bcryptjs";

const DATABASE_UNAVAILABLE = {
  error: "Account creation is temporarily unavailable. Please try again later.",
  code: "AUTH_DATABASE_UNAVAILABLE",
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
  }

  const { email, name, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || typeof name !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email, name, and password are required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
    return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
  }

  if (!normalizedName) {
    return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  if (password.length > 128) {
    return NextResponse.json({ error: "Password must be 128 characters or fewer" }, { status: 400 });
  }

  let existing: Awaited<ReturnType<typeof db.user.findUnique>>;
  try {
    existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  } catch (error) {
    console.error("[auth/register] User lookup failed", error);
    return NextResponse.json(DATABASE_UNAVAILABLE, { status: 503 });
  }

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    console.error("[auth/register] Password hashing failed", error);
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    );
  }

  try {
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("[auth/register]", error);
    return NextResponse.json(DATABASE_UNAVAILABLE, { status: 503 });
  }
}