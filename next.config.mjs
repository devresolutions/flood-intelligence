const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/flood-intelligence' : '';
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: isProd ? '/flood-intelligence/' : '',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;
