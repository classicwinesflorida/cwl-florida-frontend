/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/go/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
