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
  

  reactStrictMode: true,
  

  env: {
    MAINTENANCE_EMAIL: "building@example.com",
  },
};

export default nextConfig;