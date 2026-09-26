const isProd = process.env.NODE_ENV === 'production';
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? '/flood-intelligence' : '',
  assetPrefix: isProd ? '/flood-intelligence/' : '',
};
export default nextConfig;
