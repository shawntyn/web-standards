import type { Spec } from "@json-render/core";
import { node } from "./spec-node";
import { validateSpec } from "./validate-spec";

// 应用外壳独立于正文转换器，三个页面共用同一导航。
export function pageSpec(content: Spec): Spec {
  if (content.elements["site-frame"])
    throw new Error("正文不能使用保留 ID：site-frame");
  return validateSpec({
    root: "site-frame",
    elements: {
      "site-frame": node(
        "Frame",
        {
          brand: "Web Standard",
          links: [
            { label: "首页", href: "/" },
            { label: "项目详情", href: "/projects/atlas" },
            { label: "渠道统计", href: "/analytics/commerce" },
          ],
        },
        [content.root],
      ),
      ...content.elements,
    },
  });
}
