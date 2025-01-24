/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      "links.papareact.com",
      "i.pravatar.cc",
      "lh3.googleusercontent.com",
    ], // Google profil resimleri için
  },
  // Vercel için ek optimizasyonlar
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Fast Refresh sorununu çözmek için
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
