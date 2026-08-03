import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible subset of the auth config. Deliberately has NO providers
 * with real logic (the Credentials provider's authorize() needs Mongoose,
 * which cannot run in the Edge runtime middleware uses). Middleware builds
 * its own lightweight NextAuth instance from just this file, so it never
 * transitively imports Mongoose/bcryptjs - only the full config in
 * lib/auth.ts (used by the Node-runtime API route handler) does that.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
