/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['oceanviewapts.com.au'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    experimental: {
      serverActions: true,
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
      ];
    },
    async redirects() {
      return [
        {
          source: '/admin',
          destination: '/strata-roll',
          permanent: true,
        },
        {
          source: '/payments',
          destination: '/levies',
          permanent: true,
        },
      ];
    },
    webpack: (config, { isServer }) => {
      // Add custom webpack configurations
      if (!isServer) {
        // Client-side specific configurations
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          path: false,
        };
      }
  
      return config;
    },
  };
  
  module.exports = nextConfig;