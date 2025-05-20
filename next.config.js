const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  // Completely disable type checking during build for Netlify compatibility
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: false,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimized for Netlify deployment
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
});
