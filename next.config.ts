import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A package-lock.json exists at the home dir above this project, which makes
  // Turbopack guess the wrong workspace root. Pin it to this folder.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
