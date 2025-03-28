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

    return config;
  },
  // Disable image optimization for Netlify
  images: {
    unoptimized: true,
  },
  // Add transpilePackages for three.js
  transpilePackages: ['three'],
};

module.exports = nextConfig
