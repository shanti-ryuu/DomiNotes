const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  // Temporarily ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimized for Netlify deployment
  // trailingSlash and unoptimized images help with static hosting
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
});
