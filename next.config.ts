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
        // Additional rewrites if needed for API routes
        {
          source: "/api/maintenance/:path*",
          destination: "/api/maintenance/:path*",
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
  
    // Experimental features - preserving your existing configuration
    experimental: {
      serverComponentsExternalPackages: [],
    },
  
    // Image optimization settings
    images: {
      domains: [],
      // Enable for static export if needed, otherwise comment out
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
  
    // Output configuration - choose one based on your deployment:
    
    // Option 1: For Vercel deployment with API routes (recommended)
    // Leave this commented out for full Vercel functionality
    
    // Option 2: For static export (uncomment if deploying to static hosting)
    // output: 'export',
    // trailingSlash: true,
    // distDir: 'out',
  
    // Compiler options
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === "production",
    },
  
    // TypeScript configuration
    typescript: {
      // Ignore build errors during deployment (not recommended for production)
      // ignoreBuildErrors: false,
    },
  
    // ESLint configuration
    eslint: {
      // Ignore ESLint errors during builds (not recommended for production)
      // ignoreDuringBuilds: false,
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
  
    // Asset prefix (for CDN deployment if needed)
    // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',
  
    // Base path (if app is served from a subdirectory)
    // basePath: '/oceanview',
  
    // Internationalization (if needed)
    // i18n: {
    //   locales: ['en', 'es', 'fr'],
    //   defaultLocale: 'en',
    // },
  
    // Standalone output for Docker deployment (if needed)
    // output: 'standalone',
  };
  
  module.exports = nextConfig;