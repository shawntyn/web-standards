import { z } from "zod";
const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "内容 ID 只能包含小写字母、数字和连字符");
const text = z.string().trim().min(1).max(20000);
export const ContentBlockSchema = z.discriminatedUnion("type", [
  z
    .object({
      id,
      type: z.literal("heading"),
      text,
      level: z.union([z.literal(2), z.literal(3)]),
    })
    .strict(),
  z.object({ id, type: z.literal("paragraph"), text }).strict(),
  z
    .object({
      id,
      type: z.literal("list"),
      items: z.array(text).min(1).max(100),
      ordered: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      id,
      type: z.literal("quote"),
      text,
      attribution: text.optional(),
    })
    .strict(),
  z
    .object({
      id,
      type: z.literal("code"),
      language: z.string().max(40),
      code: z.string().min(1).max(30000),
    })
    .strict(),
  z
    .object({
      id,
      type: z.literal("table"),
      caption: text,
      columns: z.array(text).min(1).max(20),
      rows: z.array(z.array(z.string().max(2000))).max(100),
    })
    .strict()
    .refine(
      (block) => block.rows.every((row) => row.length === block.columns.length),
      { message: "每一行的单元格数量必须与列数一致", path: ["rows"] },
    ),
  z.object({ id, type: z.literal("callout"), title: text, text }).strict(),
  z
    .object({
      id,
      type: z.literal("capacity-plan"),
      title: text,
      description: text,
      initial: z.number().int().min(1).max(100),
    })
    .strict(),
]);
export const ContentSchema = z
  .array(ContentBlockSchema)
  .min(1, "至少添加一个内容块")
  .max(100)
  .refine(
    (blocks) => new Set(blocks.map((block) => block.id)).size === blocks.length,
    "内容块 ID 必须唯一",
  );
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
