import { z } from "zod";
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const QueryResultSchema = z
  .object({
    daily: z.array(z.object({ day: z.string(), order_count: count }).strict()),
    channels: z.array(
      z.object({ channel_name: z.string(), order_count: count }).strict(),
    ),
    statuses: z.array(
      z.object({ status_name: z.string(), order_count: count }).strict(),
    ),
    goals: z.array(
      z
        .object({
          team_name: z.string(),
          completed_count: count,
          target_count: z.number().int().positive(),
        })
        .strict()
        .refine((x) => x.completed_count <= x.target_count),
    ),
  })
  .strict();
export type QueryResult = z.infer<typeof QueryResultSchema>;
