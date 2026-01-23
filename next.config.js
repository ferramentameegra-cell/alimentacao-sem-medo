/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Para otimizar o build no Railway/Docker
  images: {
    domains: [],
  },
}

module.exports = nextConfig
