/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', 
      },
      {
        source: '/accounts/:path*', // <--- ADICIONE ISSO AQUI
        destination: 'http://localhost:3000/accounts/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;