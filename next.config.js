// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  i18n: {
    locales: ['en', 'it'],
    defaultLocale: 'it', // Imposta italiano come lingua predefinita
  },
};


/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  // experimental: {
  //   serverActions: {
  //     allowedOrigins: ["localhost:3000"],
  //     allowedForwardedHosts: ["localhost:3000"]
  //   }
  //}
}

module.exports = nextConfig
