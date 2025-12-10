import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  
};
// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://api-gateway:8000/:path*',
//       },
//     ];
//   },
// };
export default nextConfig;
