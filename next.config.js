// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'it'],
    defaultLocale: 'it', // Imposta italiano come lingua predefinita
  },
};


/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
}

module.exports = nextConfig
