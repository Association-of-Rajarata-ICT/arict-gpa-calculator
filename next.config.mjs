/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes (e.g. /api/eis) require server-side rendering on Vercel.
  // Static pages are still automatically optimised by Next.js / Vercel.
  images: { unoptimized: true },
};

export default nextConfig;
