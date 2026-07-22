"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// WebGL, so it needs the browser anyway - no reason to include it in
// server-rendered HTML or the initial JS bundle.
const LightRays = dynamic(() => import("@/components/LightRays"), {
  ssr: false,
});

// Functional/utility pages (forms, tables) skip the decorative background
// entirely - not just lazy-loaded, not rendered at all.
const HIDDEN_ON_PREFIXES = ["/dashboard", "/events/create", "/bookings"];

function shouldShowBackground(pathname: string): boolean {
  return !HIDDEN_ON_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const BackgroundEffects = () => {
  const pathname = usePathname();

  if (!shouldShowBackground(pathname)) return null;

  return (
    <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
      <LightRays
        raysOrigin="top-center-offset"
        raysColor="#5dfeca"
        raysSpeed={0.5}
        lightSpread={0.9}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
    </div>
  );
};

export default BackgroundEffects;
