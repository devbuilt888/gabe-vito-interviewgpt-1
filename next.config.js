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

    return config;
  },
  experimental: {
    esmExternals: 'loose',
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
}

module.exports = nextConfig
