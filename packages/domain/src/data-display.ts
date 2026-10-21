import { z } from "zod";
export const ChartPropsSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    unit: z.string(),
    emptyText: z.string(),
    points: z.array(
      z
        .object({ label: z.string(), value: z.number().finite().nonnegative() })
        .strict(),
    ),
  })
  .strict();
export const ProgressPropsSchema = z
  .object({
    title: z.string(),
    emptyText: z.string(),
    items: z.array(
      z
        .object({
          label: z.string(),
          value: z.number().finite().nonnegative(),
          max: z.number().finite().positive(),
        })
        .strict()
        .refine((x) => x.value <= x.max, "value must not exceed max"),
    ),
  })
  .strict();
