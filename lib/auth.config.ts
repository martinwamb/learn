import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe auth config — no Prisma adapter (runs in middleware/proxy)
export const authConfig: NextAuthConfig = {
  trustHost: true,
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
      // Every route under the (dashboard) group. /library is gone (replaced by
      // /stories); /faith and /admin were never listed here, which left them relying
      // solely on the layout's own session check -- now they're guarded at the edge
      // like everything else.
      const isDashboardRoute = [
        "/dashboard",
        "/lessons",
        "/stories",
        "/games",
        "/faith",
        "/admin",
      ].some((prefix) => nextUrl.pathname.startsWith(prefix));

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
