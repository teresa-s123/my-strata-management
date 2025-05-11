import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-specific configuration
  
  // Region configuration (handled by Vercel deployment settings)
  // While you can't set regions directly in next.config.js, you can document your intention
  // to deploy to Sydney region in your assignment
  
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
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
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
      {
        source: "/help",
        destination: "/support",
        permanent: false,
      },
    ];
  },
  
  // Rewrites (similar to proxying)
  async rewrites() {
    return {
      beforeFiles: [
        // Example: Proxy API requests to an external service
        {
          source: "/api/external-weather",
          destination: "https://api.weather.com/sydney",
        },
      ],
    };
  },
  
  // Other Next.js config options
  reactStrictMode: true,
  swcMinify: true,
  
  // Build output configuration
  output: "standalone",
  
  // i18n configuration
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  
  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true,
  },
  
  // Environment variables that will be available at build time
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
    SITE_URL: "https://building-management-app.vercel.app",
  },
};

export default nextConfig;