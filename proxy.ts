import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

/**
 * Enforces real route protection for organizer-only areas (previously,
 * robots.ts only asked crawlers not to index these - a courtesy, not a
 * lock; this is the actual lock) and adds baseline security headers to
 * every response.
 *
 * Named "proxy" per the Next.js 16 convention (renamed from "middleware" -
 * same functionality, same file location, just a rename).
 */

// A separate, lightweight NextAuth instance built from ONLY the edge-safe
// config - this file must never import lib/auth.ts directly, since that
// pulls in Mongoose/bcryptjs (Node-only, cannot run in Edge middleware).
const { auth } = NextAuth(authConfig);

const ORGANIZER_ONLY_PREFIXES = ["/dashboard", "/events/create"];

function requiresOrganizer(pathname: string): boolean {
  return ORGANIZER_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;

  if (requiresOrganizer(nextUrl.pathname)) {
    if (!req.auth) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== "organizer" && role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  const response = NextResponse.next();

  // Prevents the site from being embedded in an iframe elsewhere (clickjacking).
  response.headers.set("X-Frame-Options", "DENY");

  // Stops the browser from guessing/overriding a response's declared content type.
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Sends full referrer info only to same-origin requests; a trimmed,
  // origin-only referrer to cross-origin ones.
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // This app doesn't use any of these browser features - explicitly deny them.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Only takes effect over HTTPS (harmless to send otherwise, browsers
  // ignore it on plain HTTP) - forces HTTPS on repeat visits.
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains"
  );

  /**
   * Content-Security-Policy - the single most impactful header here, and
   * deliberately NOT enabled by default. A misconfigured CSP doesn't throw
   * a loud error; it silently blocks a resource (an image, a script, a
   * font) with nothing but a browser console warning. This app has several
   * things a real CSP needs to explicitly allow (Cloudinary images, the
   * PostHog /ingest proxy, Next's own hydration scripts), and this can't
   * be verified from here without a real browser to check the console in.
   *
   * To enable: uncomment below, then load every page (including the event
   * create/edit forms, which hit Cloudinary) and check the browser console
   * for any "Refused to ..." CSP violation messages before shipping it.
   */
  // response.headers.set(
  //   "Content-Security-Policy",
  //   [
  //     "default-src 'self'",
  //     "img-src 'self' data: https://res.cloudinary.com",
  //     // 'unsafe-inline'/'unsafe-eval' are required for Next's hydration
  //     // scripts without a bigger nonce-based CSP setup - this weakens
  //     // XSS protection substantially; a stricter setup needs nonces
  //     // wired through the root layout.
  //     "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  //     "style-src 'self' 'unsafe-inline'",
  //     "font-src 'self' data:",
  //     // The PostHog host itself doesn't need listing here - /ingest is
  //     // rewritten server-side (next.config.ts), so the browser only ever
  //     // sees a same-origin request.
  //     "connect-src 'self'",
  //     "frame-ancestors 'none'",
  //   ].join("; ")
  // );

  return response;
});

export const config = {
  // Skip static assets/images - headers on those don't add value and this
  // avoids running middleware on every single asset request.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
