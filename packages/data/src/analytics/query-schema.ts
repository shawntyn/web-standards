import { z } from "zod";

export const QueryResultSchema = z
  .object({
    channels: z
      .array(
        z
          .object({
            channel_name: z.string().min(1).max(80),
            order_count: z
              .number()
              .int()
              .nonnegative()
              .max(Number.MAX_SAFE_INTEGER),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
