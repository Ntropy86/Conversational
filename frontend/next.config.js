/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-markdown'],
  },
};

// When ANALYZE=true, add webpack-bundle-analyzer plugin synchronously
if (process.env.ANALYZE === 'true') {
  try {
    // require is available in this CommonJS file
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    const origWebpack = nextConfig.webpack;
    nextConfig.webpack = (config, options) => {
      config.plugins = config.plugins || [];
      config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }));
      if (typeof origWebpack === 'function') {
        return origWebpack(config, options);
      }
      return config;
    };
  } catch (e) {
    // If plugin isn't available, just continue without analyzer
    // eslint-disable-next-line no-console
    console.warn('webpack-bundle-analyzer not available:', e && e.message ? e.message : e);
  }
}

module.exports = nextConfig;
