import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  async redirects() {
    return [
      { source: "/jj-legal", destination: "/apply", permanent: true },
      { source: "/jj-legal/:path*", destination: "/apply", permanent: true },
      { source: "/jjlegal", destination: "/apply", permanent: true },
      { source: "/jjlegal/:path*", destination: "/apply", permanent: true },
    ];
  },
};

export default nextConfig;
