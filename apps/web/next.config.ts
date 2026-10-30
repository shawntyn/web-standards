import type { NextConfig } from "next";
import { resolve } from "node:path";
const config: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/render", "@repo/data", "@repo/domain"],
  outputFileTracingRoot: resolve(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/*": ["../../packages/data/src/projects/*.json"],
  },
};
export default config;
