import withBundleAnalyzer from '@next/bundle-analyzer';
import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/go/:path*',
        destination: isProd
          ? 'https://cwl-florida-automation-341657293532.us-central1.run.app/api/:path*'
          : 'http://localhost:3000/api/:path*',
      },
    ];
  },
  webpack(config: Configuration, { isServer }) {
    // Only apply optimizations on client-side builds
    if (!isServer) {
      config.optimization = {
        ...(config.optimization || {}),
        splitChunks: {
          chunks: 'all',
          maxSize: 100000,    // ~100 KB: adjust up/down (bytes)
          minSize: 20000,     // minimum chunk size
          maxInitialRequests: 30,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    // Add fallbacks for Node.js polyfills if needed
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          os: false,
        },
      };
    }

    return config;
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);