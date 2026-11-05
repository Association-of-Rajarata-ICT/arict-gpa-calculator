/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static: every grade lives in the visitor's browser, so there is no server code.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
