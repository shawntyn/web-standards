import { z } from "zod";

const text = z.string().min(1).max(2000);
const headingLevel = z.literal([1, 2, 3, 4, 5, 6]);

// 源内容与 json-render catalog 共用这些属性规则。
export const componentPropsSchemas = {
  Heading: z
    .object({
      text,
      level: headingLevel.optional(),
    })
    .strict(),
  Text: z.object({ text }).strict(),
  Stack: z.object({ gap: z.enum(["sm", "md", "lg"]).optional() }).strict(),
  Grid: z.object({ columns: z.literal([1, 2, 3, 4]).optional() }).strict(),
  Card: z
    .object({
      title: text.optional(),
      titleLevel: headingLevel.optional(),
      description: text.optional(),
    })
    .strict(),
  Button: z.object({ label: text, href: text }).strict(),
  List: z
    .object({ items: z.array(text).max(20), ordered: z.boolean().optional() })
    .strict(),
  Table: z
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
