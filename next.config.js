/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // <--- This must be inside the brackets
  images: {
    unoptimized: true,
  },
  // If your site is at papermint.group/DriverRate, add this:
  basePath: '/DriverRate', 
}

module.exports = nextConfig;