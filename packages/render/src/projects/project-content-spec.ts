import type { Spec } from "@json-render/core";
import { ContentSchema, type Project, type ContentBlock } from "@repo/domain";

type Element = Spec["elements"][string];

/** Only protocol adaptation: semantic aliases do not add visible nodes. */
function component(block: ContentBlock): Pick<Element, "type" | "props"> {
  if (/^h[1-6]$/.test(block.type)) {
    return {
      type: "Heading",
      props: { ...block.props, level: Number(block.type.slice(1)) },
    };
  }
  return { type: block.type === "p" ? "Text" : block.type, props: block.props };
}

/** Flatten the authored tree. Every input node produces exactly one element. */
export function projectContentSpec(project: Pick<Project, "content">): Spec {
  const content = ContentSchema.parse(project.content);
  const elements: Spec["elements"] = {};
  function mapNode(block: ContentBlock): string {
    const children = block.children?.map(mapNode) ?? [];
    const slots = block.slots
      ? Object.fromEntries(
          Object.entries(block.slots).map(([name, nodes]) => [
            name,
            nodes.map(mapNode),
          ]),
        )
      : undefined;
    elements[block.id] = {
      ...component(block),
      children,
      ...(slots ? { slots } : {}),
    };
    return block.id;
  }
  return { root: mapNode(content), elements };
}
