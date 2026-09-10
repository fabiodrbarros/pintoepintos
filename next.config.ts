import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    preloadEntriesOnStart: false,
    webpackMemoryOptimizations: true,
  },
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    return config;
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
