import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma-client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        if (dbUser) {
          (session.user as Record<string, unknown>).birthYear = dbUser.birthYear;
          (session.user as Record<string, unknown>).eraSkin = dbUser.eraSkin;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as Record<string, unknown>).birthYear = (user as Record<string, unknown>).birthYear;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "rewind-secret-key-change-in-production",
};