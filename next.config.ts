import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have proper TypeScript definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Server actions configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  
  // Image domains configuration
  images: {
    domains: ['via.placeholder.com'],
  },
  
  // Webpack configuration for handling Node.js modules in the browser
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default pwaConfig(nextConfig);
