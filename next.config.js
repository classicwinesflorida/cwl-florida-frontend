/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";

    return [
      {
        source: "/api/go/:path*",
        destination: isProd
          ? "https://your-backend-service-url/api/:path*" // Use actual BE URL in prod
          : "http://localhost:3000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
