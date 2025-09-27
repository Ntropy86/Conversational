/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Performance optimizations
  poweredByHeader: false,
  
  // Optimize CSS
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-markdown'],
  },
  
  // Bundle analyzer in production
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      // In an ESM next.config.mjs, `require` is not available. Use createRequire to load CJS modules.
      try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      } catch (e) {
        // Fallback: attempt dynamic import (some environments may support it)
        try {
          const mod = await import('webpack-bundle-analyzer');
          const BundleAnalyzerPlugin = mod.BundleAnalyzerPlugin || mod.default?.BundleAnalyzerPlugin || mod.default;
          if (BundleAnalyzerPlugin) {
            config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }));
          }
        } catch (err) {
          console.warn('BundleAnalyzerPlugin could not be loaded for ANALYZE build:', err);
        }
      }

      return config;
    },
  }),
};

export default nextConfig;
