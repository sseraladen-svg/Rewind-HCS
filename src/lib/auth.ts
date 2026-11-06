import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma-client";
import bcrypt from "bcryptjs";

const DATABASE_UNAVAILABLE = "AUTH_DATABASE_UNAVAILABLE";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        if (!email || !credentials.password) return null;

        let user;
        try {
          user = await db.user.findUnique({ where: { email } });
        } catch (error) {
          console.error("[auth] User lookup failed", error);
          throw new Error(DATABASE_UNAVAILABLE);
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          birthYear: user.birthYear,
          eraSkin: user.eraSkin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as Record<string, unknown>).birthYear = token.birthYear;
        (session.user as Record<string, unknown>).eraSkin = token.eraSkin;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as unknown as Record<string, unknown>;
        token.birthYear = u.birthYear;
        token.eraSkin = u.eraSkin;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
