import type { Spec } from "@json-render/core";
import { ContentSchema, type ContentBlock } from "@repo/domain";

// 嵌套 JSON → 扁平 Spec。每个源节点只生成一个元素，不补写页面内容。
export function contentToSpec(raw: unknown): Spec {
  const content = ContentSchema.parse(raw);
  const elements: Spec["elements"] = {};

  function mapNode(node: ContentBlock): string {
    const children = node.children?.map(mapNode) ?? [];
    const slots = node.slots
      ? Object.fromEntries(
          Object.entries(node.slots).map(([name, nodes]) => [
            name,
            nodes.map(mapNode),
          ]),
        )
      : undefined;
    const heading = /^h([1-6])$/.exec(node.type);
    elements[node.id] = {
      type: heading ? "Heading" : node.type === "p" ? "Text" : node.type,
      props: heading
        ? { ...node.props, level: Number(heading[1]) }
        : node.props,
      children,
      ...(slots ? { slots } : {}),
    };
    return node.id;
  }

  return { root: mapNode(content), elements };
}
