/** @type {import('next').NextConfig} */
const nextConfig = {
  // SPA mode — all routing handled by React Router
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
