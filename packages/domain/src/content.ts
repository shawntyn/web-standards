import { z } from "zod";

const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "节点 ID 只能包含小写字母、数字和连字符");
const text = z.string().min(1).max(20000);
const heading = z.object({ text, eyebrow: text.optional() }).strict();
const empty = z.object({}).strict();
const propsSchemas = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: z.object({ text, tone: z.enum(["default", "muted"]).optional() }).strict(),
  Stack: z.object({ gap: z.enum(["sm", "md", "lg"]).optional() }).strict(),
  Grid: z
    .object({ columns: z.number().int().min(1).max(4).optional() })
    .strict(),
  Split: empty,
  Card: z
    .object({ title: text.optional(), description: text.optional() })
    .strict(),
  Badge: z
    .object({ text, tone: z.enum(["neutral", "success", "accent"]).optional() })
    .strict(),
  Metric: z
    .object({ value: text, label: text, detail: text.optional() })
    .strict(),
  LinkButton: z
    .object({
      label: text,
      href: z.string().min(1),
      variant: z.enum(["primary", "secondary"]).optional(),
    })
    .strict(),
  Code: z
    .object({ code: z.string().min(1).max(30000), label: text.optional() })
    .strict(),
  Callout: z.object({ title: text, text }).strict(),
  ContentList: z
    .object({
      items: z.array(text).min(1).max(100),
      ordered: z.boolean().optional(),
    })
    .strict(),
  Quote: z.object({ text, attribution: text.optional() }).strict(),
  ContentTable: z
    .object({
      caption: text,
      columns: z.array(text).min(1).max(20),
      rows: z.array(z.array(z.string().max(2000))).max(100),
    })
    .strict()
    .refine(
      (props) => props.rows.every((row) => row.length === props.columns.length),
      { message: "每一行的单元格数量必须与列数一致", path: ["rows"] },
    ),
  CapacityPlanner: z
    .object({ initial: z.number().int().min(1).max(100) })
    .strict(),
};
type NodeKind = keyof typeof propsSchemas;
type NodeShape = {
  [K in NodeKind]: {
    id: string;
    type: K;
    props: z.infer<(typeof propsSchemas)[K]>;
  };
}[NodeKind];
export type ContentBlock = NodeShape & {
  children?: ContentBlock[];
  slots?: { header?: ContentBlock[]; footer?: ContentBlock[] };
};

const leaf = <K extends NodeKind>(type: K) =>
  z.object({ id, type: z.literal(type), props: propsSchemas[type] }).strict();
export const ContentBlockSchema: z.ZodType<ContentBlock> = z.lazy(() => {
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
    leaf("Split").extend({ children }).strict(),
    leaf("Card")
      .extend({
        children,
        slots: z
          .object({
            header: z.array(ContentBlockSchema).max(100).optional(),
            footer: z.array(ContentBlockSchema).max(100).optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    leaf("Badge"),
    leaf("Metric"),
    leaf("LinkButton"),
    leaf("Code"),
    leaf("Callout"),
    leaf("ContentList"),
    leaf("Quote"),
    leaf("ContentTable"),
    leaf("CapacityPlanner"),
  ]);
});

/** The root, nesting and named slots are authored data, never mapper defaults. */
export const ContentSchema = ContentBlockSchema.superRefine((root, context) => {
  const seen = new Set<string>();
  let count = 0;
  const visit = (
    node: ContentBlock,
    path: (string | number)[],
    depth: number,
  ) => {
    if (seen.has(node.id))
      context.addIssue({
        code: "custom",
        path: [...path, "id"],
        message: "整棵内容树的节点 ID 必须唯一",
      });
    seen.add(node.id);
    count += 1;
    if (depth > 20)
      context.addIssue({
        code: "custom",
        path,
        message: "内容树最多嵌套 20 层",
      });
    if ("children" in node)
      node.children?.forEach((child, index) =>
        visit(child, [...path, "children", index], depth + 1),
      );
    if ("slots" in node && node.slots)
      Object.entries(node.slots).forEach(([slot, nodes]) =>
        nodes?.forEach((child, index) =>
          visit(child, [...path, "slots", slot, index], depth + 1),
        ),
      );
  };
  visit(root, [], 0);
  if (count > 300)
    context.addIssue({ code: "custom", message: "内容树最多包含 300 个节点" });
});
