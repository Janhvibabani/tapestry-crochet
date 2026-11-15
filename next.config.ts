import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge covers the phone toolbars in the editor and crochet mode.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
