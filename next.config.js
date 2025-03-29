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

    // Handle PDF.js
    config.module.rules.push({
      test: /pdfjs-dist/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      ],
    });

    // Optimize PDF.js bundle
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          pdfjs: {
            test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
            name: 'pdfjs',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };

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
  // Add Netlify-specific configuration
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  output: 'standalone',
}

module.exports = nextConfig
