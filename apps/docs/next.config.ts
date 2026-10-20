import createMDX from "@next/mdx";
import type { NextConfig } from "next";
const config: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  transpilePackages: ["@repo/ui", "@repo/render", "@repo/data", "@repo/domain"],
};
export default createMDX()(config);
