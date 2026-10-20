import type { Spec } from "@json-render/core";
import { node, type Node } from "./spec-node";
import { validateSpec } from "./validate-spec";

/** Application navigation only; it does not choose the document's content. */
export function shell(
  elements: Record<string, Node>,
  children: string[],
): Spec {
  return validateSpec({
    root: "frame",
    elements: {
      frame: node(
        "Frame",
        {
          brand: "Web / 工程规范",
          subtitle: "FULL-STACK REFERENCE",
          links: [
            { label: "项目示例", href: "/" },
            { label: "架构规范", href: "/standards" },
            { label: "项目工作台", href: "/projects" },
            {
              label: "组件文档 ↗",
              href: process.env.DOCS_ORIGIN ?? "http://localhost:3001",
            },
          ],
        },
        ["page"],
      ),
      page: node("Stack", { gap: "lg" }, children),
      ...elements,
    },
  });
}
