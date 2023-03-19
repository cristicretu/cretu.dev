/** @type {import('next').NextConfig} */
const { withContentlayer } = require('next-contentlayer')

const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = withContentlayer(nextConfig)
