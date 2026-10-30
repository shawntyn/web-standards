import { z } from "zod";
import { componentPropsSchemas } from "./component-props-schema";

const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/);
// 源 JSON 用 h1…h6 表达级别，不接受 props.level。
const heading = componentPropsSchemas.Heading.omit({ level: true });
const propsSchemas = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: componentPropsSchemas.Text,
  Stack: componentPropsSchemas.Stack,
  Grid: componentPropsSchemas.Grid,
  Card: componentPropsSchemas.Card,
  Button: componentPropsSchemas.Button,
  List: componentPropsSchemas.List,
  Table: componentPropsSchemas.Table,
};

type ContentType = keyof typeof propsSchemas;
type ContentNodeBase = {
  [K in ContentType]: {
    id: string;
    type: K;
    props: z.infer<(typeof propsSchemas)[K]>;
  };
}[ContentType];
export type ContentNode = ContentNodeBase & {
  children?: ContentNode[];
  slots?: { header?: ContentNode[]; footer?: ContentNode[] };
};

const nodeSchema = <K extends ContentType>(type: K) =>
  z.object({ id, type: z.literal(type), props: propsSchemas[type] }).strict();

const ContentNodeSchema: z.ZodType<ContentNode> = z.lazy(() => {
  const children = z.array(ContentNodeSchema).max(100).optional();
  return z.union([
    nodeSchema("h1"),
    nodeSchema("h2"),
    nodeSchema("h3"),
    nodeSchema("h4"),
    nodeSchema("h5"),
    nodeSchema("h6"),
    nodeSchema("p"),
    nodeSchema("Stack").extend({ children }),
    nodeSchema("Grid").extend({ children }),
    nodeSchema("Card").extend({
      children,
      slots: z
        .object({
          header: z.array(ContentNodeSchema).max(20).optional(),
          footer: z.array(ContentNodeSchema).max(20).optional(),
        })
        .strict()
        .optional(),
    }),
    nodeSchema("Button"),
    nodeSchema("List"),
    nodeSchema("Table"),
  ]);
});

// ID 在整棵树内唯一，children 与命名 slots 都参与检查。
export const ContentSchema = ContentNodeSchema.superRefine((root, context) => {
  const seen = new Set<string>();
  let count = 0;
  function visit(node: ContentNode, depth: number) {
    if (seen.has(node.id))
      context.addIssue({ code: "custom", message: `重复节点 ID：${node.id}` });
    seen.add(node.id);
    count += 1;
    if (depth > 20)
      context.addIssue({ code: "custom", message: "内容最多嵌套 20 层" });
    node.children?.forEach((child) => visit(child, depth + 1));
    Object.values(node.slots ?? {})
      .flat()
      .forEach((child) => visit(child, depth + 1));
  }
  visit(root, 0);
  if (count > 100)
    context.addIssue({ code: "custom", message: "内容最多包含 100 个节点" });
});
