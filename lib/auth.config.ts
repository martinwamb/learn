import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe auth config — no Prisma adapter (runs in middleware/proxy)
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/signin");
      const isDashboardRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/lessons") ||
        nextUrl.pathname.startsWith("/library");

      if (isDashboardRoute) return isLoggedIn;
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  session: { strategy: "jwt" },
};
