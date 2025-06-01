import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/maintenance-request",
        destination: "/maintenance",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Allow PHP files to be served alongside Next.js
      {
        source: "/php-maintenance",
        destination: "/php-maintenance.html",
      },
    ];
  },
  reactStrictMode: true,
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
  },
  // Important: Don't interfere with Vercel's PHP runtime
  experimental: {
    // Empty - no experimental features that could break JS code
  },
};

export default nextConfig;