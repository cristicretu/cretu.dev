/** @type {import('next').NextConfig} */
const { withContentlayer } = require('next-contentlayer');

const nextConfig = {
   experimental: { 
    appDir: true,
    concurrentFeatures: true, 
    reactRoot: true, 
    runtime: "nodejs", 
  }
};

module.exports = withContentlayer(nextConfig);
