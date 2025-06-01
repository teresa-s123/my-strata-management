/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    // Empty experimental section - no problematic options
  },
};

module.exports = nextConfig;