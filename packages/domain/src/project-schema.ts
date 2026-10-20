import { z } from "zod";
import { ContentSchema } from "./content";
export const ProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "标识至少 2 个字符")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "使用小写字母、数字和单个连字符"),
  name: z.string().trim().min(2, "名称至少 2 个字符").max(80),
  category: z.string().trim().min(1, "请填写分类").max(40),
  description: z.string().trim().min(10, "描述至少 10 个字符").max(1000),
  status: z.enum(["运行中", "构建中", "已归档"]),
  progress: z.number().int().min(0).max(100),
  members: z.number().int().min(1).max(10000),
  tasks: z.number().int().min(0).max(1000000),
  content: ContentSchema,
  features: z.array(z.string().trim().min(1).max(120)).max(12),
});
export type Project = z.infer<typeof ProjectSchema>;
export const ProjectListSchema = z.array(ProjectSchema).max(100);
export const MutationSchema = z
  .object({ project: ProjectSchema, simulateError: z.boolean().optional() })
  .strict();
