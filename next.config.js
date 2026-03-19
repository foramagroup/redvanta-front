/** next.config.js */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "your-cdn.com"]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  }
};

module.exports = nextConfig;
