/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["img-cdn.magiceden.dev", "pbs.twimg.com"],
  },
};

module.exports = nextConfig;
