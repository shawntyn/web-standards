import { z } from "zod";
import { ContentSchema } from "./content";

export const ProjectSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1).max(80),
    description: z.string().min(1).max(200),
    content: ContentSchema,
  })
  .strict();
export type Project = z.infer<typeof ProjectSchema>;
export const ProjectListSchema = z
  .array(ProjectSchema)
  .refine(
    (projects) =>
      new Set(projects.map((project) => project.slug)).size === projects.length,
    "项目 slug 必须唯一",
  );
