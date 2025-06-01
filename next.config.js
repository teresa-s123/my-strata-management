/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers - preserving your existing configuration
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

  // Redirects - preserving your existing configuration
  async redirects() {
    return [
      {
        source: "/maintenance-request",
        destination: "/maintenance",
        permanent: true,
      },
    ];
  },

  // Rewrites - preserving your existing configuration
  async rewrites() {
    return [
      // Allow PHP files to be served alongside Next.js
      {
        source: "/php-maintenance",
        destination: "/php-maintenance.html",
      },
    ];
  },

  // React configuration
  reactStrictMode: true,

  // Environment variables - preserving your existing configuration
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
  },

  // Experimental features - correct for Next.js 14
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;