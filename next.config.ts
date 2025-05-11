import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
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
  
  // Redirects configuration
  async redirects() {
    return [
      {
        source: "/maintenance-request",
        destination: "/maintenance",
        permanent: true,
      },
    ];
  },
  
  // Other Next.js config options
  reactStrictMode: true,
  
  // Environment variables that will be available at build time
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
  },
};

export default nextConfig;