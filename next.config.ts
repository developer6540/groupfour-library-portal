import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Explicitly set project root so Turbopack ignores parent-directory lockfiles
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
