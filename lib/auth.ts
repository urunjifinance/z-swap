import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// NOTE ON OTP: In production, add a dedicated /api/auth/otp/request and
// /api/auth/otp/verify pair backed by an SMS gateway (e.g. Africa's Talking,
// Twilio Verify) and a short-lived OTP table. The credentials provider below
// verifies the OTP token server-side before issuing a session, so the OTP
// flow slots in without changing the client login form.

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Phone or Email + Password",
      credentials: {
        identifier: { label: "Phone or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.identifier }, { phone: credentials.identifier }],
          },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
          registrationFeePaid: user.registrationFeePaid,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role;
        token.verificationStatus = (user as any).verificationStatus;
        token.registrationFeePaid = (user as any).registrationFeePaid;
      }
      // Re-read from the database after login, when the session is updated,
      // or while the user has not paid yet.
      if (token.sub && (trigger === "update" || token.registrationFeePaid !== true)) {
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, verificationStatus: true, registrationFeePaid: true },
        });
        if (u) {
          token.role = u.role;
          token.verificationStatus = u.verificationStatus;
          token.registrationFeePaid = u.registrationFeePaid;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).verificationStatus = token.verificationStatus;
        (session.user as any).registrationFeePaid = token.registrationFeePaid;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
