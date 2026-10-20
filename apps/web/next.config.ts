import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/render", "@repo/data"],
};
export default config;
