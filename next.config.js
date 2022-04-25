/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withContentlayer } = require('next-contentlayer')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  resolve: {
    fallback: {
      fs: false,
    },
  },
  images: {
    domains: ['api.microlink.io'],
  },
}

module.exports = withContentlayer({ nextConfig })
