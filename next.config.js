// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'it'],
    defaultLocale: 'it', // Imposta italiano come lingua predefinita
  },
};

const nextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ]
      }
    ]
  }
}

module.exports = nextConfig
