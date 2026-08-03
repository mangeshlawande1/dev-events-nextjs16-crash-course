"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();

  // Theme is unknown until mounted (it lives in localStorage) - wait
  // rather than flash the rays on briefly if light mode is persisted.
  const [mounted, setMounted] = useState(false);
  // Standard hydration-safe "wait for mount" pattern (next-themes' own
  // recommended approach), not an accidental cascading-render bug.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!shouldShowBackground(pathname)) return null;

  // Glowing teal rays were designed against a near-black background -
  // they don't translate to light mode, so skip them there entirely
  // rather than render something that looks wrong.
  if (resolvedTheme === "light") return null;

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
