/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
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

  // Redirects
  async redirects() {
    return [
      {
        source: "/maintenance-request",
        destination: "/maintenance",
        permanent: true,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: "/php-maintenance",
        destination: "/php-maintenance.html",
      },
    ];
  },

  // React configuration
  reactStrictMode: true,

  // Environment variables
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
  },

  // FIXED: Updated for Next.js 15 - moved serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: [],

  // Remove the experimental section since it's no longer needed
};

module.exports = nextConfig;