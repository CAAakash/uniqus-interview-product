/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // exceljs ships a browser bundle; force webpack to resolve it.
      // Without this, some installs pull in the Node entry which references
      // 'fs' / 'stream' and fails silently at runtime in client components.
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        exceljs: "exceljs/dist/exceljs.min.js",
      };
    }
    return config;
  },
};

export default nextConfig;
