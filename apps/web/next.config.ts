import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/render", "@repo/data", "@repo/domain"],
};
export default config;
