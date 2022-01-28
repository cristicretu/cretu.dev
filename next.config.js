module.exports = {
  swcMinify: true,
  resolve: {
    fallback: {
      fs: false
    }
  },
  images: {
    domains: ['api.microlink.io']
  }
};
