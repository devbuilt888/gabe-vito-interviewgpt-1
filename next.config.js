/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
      canvas: false,
      path: false,
      stream: false,
      zlib: false,
      http: false,
      https: false,
      crypto: false,
      buffer: false,
    };

    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Handle Three.js
    config.module.rules.push({
      test: /three\/examples\/jsm/,
      use: 'null-loader',
    });

    // Handle PDF.js in a Netlify-compatible way
    config.module.rules.push({
      test: /pdfjs-dist/,
      use: 'null-loader',
    });

    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Critical Netlify-specific configuration
  output: 'standalone',
  // The target is important for Netlify
  target: process.env.NEXT_USE_NETLIFY_EDGE ? 'experimental-serverless-trace' : undefined,
  // Enable Netlify-specific asset prefix - helps with routing
  assetPrefix: process.env.NETLIFY ? '/_next' : undefined,
}

module.exports = nextConfig
