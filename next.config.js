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
          // Additional security headers for cookie functionality
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

  // Redirects - preserving your existing configuration
  async redirects() {
    return [
      {
        source: "/maintenance-request",
        destination: "/maintenance",
        permanent: true,
      },
      // Additional redirects for cookie demo
      {
        source: "/signin",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/profile",
        destination: "/dashboard",
        permanent: false,
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

  // Environment variables - preserving and extending your existing configuration
  env: {
    MAINTENANCE_EMAIL: "building@example.com",
    // Cookie-related environment variables
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",
    SESSION_TIMEOUT: process.env.SESSION_TIMEOUT || "1800000", // 30 minutes
    SECURE_COOKIES: process.env.NODE_ENV === "production" ? "true" : "false",
  },

  // FIXED: Updated experimental configuration for Next.js 15
  experimental: {
    // Remove the deprecated serverComponentsExternalPackages
    // It's now handled automatically or use serverExternalPackages if needed
  },

  // NEW: Use serverExternalPackages instead (if you need it)
  serverExternalPackages: [
    // Add any packages that should be external to the server bundle
    // Leave empty for most applications
  ],

  // Image optimization settings
  images: {
    domains: [],
    // Enable for static export if needed
    // unoptimized: true,
  },

  // Webpack configuration for cookie functionality
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure client-side code works properly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // PoweredByHeader
  poweredByHeader: false,

  // Compression
  compress: true,

  // Generate ETags for pages
  generateEtags: true,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Trailing slash configuration
  trailingSlash: false,
};

module.exports = nextConfig;