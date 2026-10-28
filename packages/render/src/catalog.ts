import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const text = z.string();
export const catalog = defineCatalog(schema, {
  components: {
    Frame: {
      props: z
        .object({
          brand: text,
          links: z.array(z.object({ label: text, href: text }).strict()),
        })
        .strict(),
      slots: ["default"],
    },
    Stack: {
      props: z.object({ gap: z.enum(["sm", "md", "lg"]).optional() }).strict(),
      slots: ["default"],
    },
    Grid: {
      props: z
        .object({ columns: z.number().int().min(1).max(4).optional() })
        .strict(),
      slots: ["default"],
    },
    Heading: {
      props: z
        .object({
          text,
          level: z
            .union([
              z.literal(1),
              z.literal(2),
              z.literal(3),
              z.literal(4),
              z.literal(5),
              z.literal(6),
            ])
            .optional(),
        })
        .strict(),
    },
    Text: { props: z.object({ text }).strict() },
    Card: {
      props: z
        .object({ title: text.optional(), description: text.optional() })
        .strict(),
      slots: ["default", "header", "footer"],
    },
    LinkButton: { props: z.object({ label: text, href: text }).strict() },
    ContentList: {
      props: z
        .object({ items: z.array(text), ordered: z.boolean().optional() })
        .strict(),
    },
    ContentTable: {
      props: z
        .object({
          caption: text,
          columns: z.array(text).min(1),
          rows: z.array(z.array(text)),
        })
        .strict()
        .refine((props) =>
          props.rows.every((row) => row.length === props.columns.length),
        ),
    },
  },
  actions: {},
});
