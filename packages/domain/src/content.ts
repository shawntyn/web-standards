import { z } from "zod";

const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/);
const text = z.string().min(1).max(2000);
const heading = z.object({ text }).strict();
const propsSchemas = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: z.object({ text }).strict(),
  Stack: z.object({ gap: z.enum(["sm", "md", "lg"]).optional() }).strict(),
  Grid: z
    .object({ columns: z.number().int().min(1).max(4).optional() })
    .strict(),
  Card: z
    .object({ title: text.optional(), description: text.optional() })
    .strict(),
  LinkButton: z.object({ label: text, href: text }).strict(),
  ContentList: z
    .object({ items: z.array(text).max(20), ordered: z.boolean().optional() })
    .strict(),
  ContentTable: z
    .object({
      caption: text,
      columns: z.array(text).min(1).max(10),
      rows: z.array(z.array(z.string().max(2000))).max(100),
    })
    .strict()
    .refine(
      (props) => props.rows.every((row) => row.length === props.columns.length),
      "表格每行的单元格数量必须与列数一致",
    ),
};

type Kind = keyof typeof propsSchemas;
type Node = {
  [K in Kind]: {
    id: string;
    type: K;
    props: z.infer<(typeof propsSchemas)[K]>;
  };
}[Kind];
export type ContentBlock = Node & {
  children?: ContentBlock[];
  slots?: { header?: ContentBlock[]; footer?: ContentBlock[] };
};

const leaf = <K extends Kind>(type: K) =>
  z.object({ id, type: z.literal(type), props: propsSchemas[type] }).strict();

const ContentBlockSchema: z.ZodType<ContentBlock> = z.lazy(() => {
  const children = z.array(ContentBlockSchema).max(100).optional();
  return z.union([
    leaf("h1"),
    leaf("h2"),
    leaf("h3"),
    leaf("h4"),
    leaf("h5"),
    leaf("h6"),
    leaf("p"),
    leaf("Stack").extend({ children }).strict(),
    leaf("Grid").extend({ children }).strict(),
    leaf("Card")
      .extend({
        children,
        slots: z
          .object({
            header: z.array(ContentBlockSchema).max(20).optional(),
            footer: z.array(ContentBlockSchema).max(20).optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    leaf("LinkButton"),
    leaf("ContentList"),
    leaf("ContentTable"),
  ]);
});

// ID 在整棵树内唯一，children 与命名 slots 都参与检查。
export const ContentSchema = ContentBlockSchema.superRefine((root, context) => {
  const seen = new Set<string>();
  let count = 0;
  function visit(node: ContentBlock, depth: number) {
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
