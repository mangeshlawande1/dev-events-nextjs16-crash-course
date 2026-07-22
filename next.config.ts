import type { NextConfig } from "next";
import { clientEnv } from "./lib/env";

const posthogHost = clientEnv.NEXT_PUBLIC_POSTHOG_HOST;

const nextConfig: NextConfig = {
  typescript :{
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns:[    
      {
        protocol:'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
      {
        source: "/ingest/decide",
        destination: `${posthogHost}/decide`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
