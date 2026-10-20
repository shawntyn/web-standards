import type { Spec } from "@json-render/core";
import { ProjectSchema, type ContentBlock, type Project } from "@repo/domain";

type Node = Spec["elements"][string];
type MappedBlock = { id: string; elements: Record<string, Node> };
const node = (
  type: string,
  props: Record<string, unknown>,
  children: string[] = [],
  slots?: Record<string, string[]>,
): Node => ({ type, props, children, ...(slots ? { slots } : {}) });

// Content is a domain model, not a JSON-encoded component tree. This is the only
// adapter that knows how a content block becomes a catalog component.
function mapContentBlock(block: ContentBlock): MappedBlock {
  const id = `content:${block.id}`;
  let element: Node;
  switch (block.type) {
    case "heading":
      element = node("Heading", { text: block.text, level: block.level });
      break;
    case "paragraph":
      element = node("Text", { text: block.text });
      break;
    case "list":
      element = node("ContentList", {
        items: block.items,
        ordered: block.ordered ?? false,
      });
      break;
    case "quote":
      element = node("Quote", {
        text: block.text,
        attribution: block.attribution,
      });
      break;
    case "code":
      element = node("Code", { code: block.code, label: block.language });
      break;
    case "table":
      element = node("ContentTable", {
        caption: block.caption,
        columns: block.columns,
        rows: block.rows,
      });
      break;
    case "callout":
      element = node("Callout", { title: block.title, text: block.text });
      break;
    case "capacity-plan":
      return {
        id,
        elements: {
          [id]: node(
            "ContentSection",
            { title: block.title, description: block.description },
            [],
            { interactive: [`slot:${block.id}:planner`] },
          ),
          [`slot:${block.id}:planner`]: node("CapacityPlanner", {
            initial: block.initial,
          }),
        },
      };
    default: {
      const unreachable: never = block;
      throw new Error(`Unsupported content: ${String(unreachable)}`);
    }
  }
  return { id, elements: { [id]: element } };
}

export function projectContentSpec(project: Project): Spec {
  // map preserves the author-controlled block order. Reordering/adding content
  // requires editing only the project's JSON, never a route or page template.
  const validProject = ProjectSchema.parse(project);
  const blocks = validProject.content.map(mapContentBlock);
  return {
    root: "document",
    elements: {
      document: node("Document", {}, [
        "document-title",
        "document-description",
        ...blocks.map((block) => block.id),
      ]),
      "document-title": node("Heading", { text: validProject.name, level: 1 }),
      "document-description": node("Text", {
        text: validProject.description,
        tone: "muted",
      }),
      ...Object.assign({}, ...blocks.map((block) => block.elements)),
    },
  };
}
