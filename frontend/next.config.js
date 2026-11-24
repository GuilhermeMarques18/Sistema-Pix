/** @type {import('next').NextConfig} */
const apiProxyTarget = (process.env.API_PROXY_TARGET || 'http://localhost:3000').replace(/\/+$/, '');

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: '/accounts/:path*',
        destination: `${apiProxyTarget}/accounts/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
