/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "oaidalleapiprodscus.blob.core.windows.net",
      'www.google.com',
      'flaticon.com'
    ],
  },
  env: {
    COINBASE_CLIENT_ID: process.env.COINBASE_CLIENT_ID,
    COINBASE_CLIENT_SECRET: process.env.COINBASE_CLIENT_SECRET,
    COINBASE_REDIRECT_URI: process.env.COINBASE_REDIRECT_URI,
  },
};

module.exports = nextConfig;
