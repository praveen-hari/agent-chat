import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* Transpile the local @agent-chat/react library source */
  transpilePackages: ['@agent-chat/react'],
  webpack: (config) => {
    // Resolve @agent-chat/react to the library source
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@agent-chat/react': path.resolve(__dirname, '../src/index.ts'),
    };
    return config;
  },
};

export default nextConfig;
