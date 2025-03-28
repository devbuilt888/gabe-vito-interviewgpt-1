/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add a rule to handle canvas.node
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Add a rule to handle canvas
    config.module.rules.push({
      test: /canvas/,
      use: 'null-loader',
    });

    // Add a rule to handle three.js
    config.module.rules.push({
      test: /three/,
      use: 'null-loader',
    });

    // Add fallback for node-fetch
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
    };

    return config;
  },
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Add transpilePackages for three.js
  transpilePackages: ['three'],
  // Add experimental features
  experimental: {
    serverActions: true,
  },
  // Add typescript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add eslint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig
