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

    // Handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });

    // Add rule for PDF.js
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
  // Disable Vercel Analytics
  analytics: false,
  // Add Netlify-specific configuration
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
}

module.exports = nextConfig
