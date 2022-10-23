/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withContentlayer } = require('next-contentlayer')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/bee.js',
        destination: 'https://cdn.splitbee.io/sb.js',
      },
      {
        source: '/_hive/:slug',
        destination: 'https://hive.splitbee.io/:slug',
      },
    ]
  },
}

module.exports = withContentlayer({ nextConfig })
