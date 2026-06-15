import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next.js 16 proxy (replaces middleware.ts)
// Uses Edge-safe JWT auth config — no Prisma dependency
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|audio|images).*)"],
};
