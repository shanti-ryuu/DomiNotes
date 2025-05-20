const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  // Disable type checking during build to overcome Netlify issues
  typescript: {
    ignoreBuildErrors: true,
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
