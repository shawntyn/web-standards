import { z } from "zod";
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
  features: z.array(z.string().trim().min(1).max(120)).max(12),
});
export type Project = z.infer<typeof ProjectSchema>;
export const ProjectListSchema = z.array(ProjectSchema).max(100);
export const MutationSchema = z
  .object({ project: ProjectSchema, simulateError: z.boolean().optional() })
  .strict();
export const STORAGE_KEY = "web-standards:projects:v1";
export type ProjectDraft = Record<keyof Project, string>;
export const emptyDraft: ProjectDraft = {
  slug: "",
  name: "",
  category: "产品应用",
  description: "",
  status: "构建中",
  progress: "0",
  members: "1",
  tasks: "0",
  features: "",
};
export function toDraft(project: Project): ProjectDraft {
  return {
    ...project,
    progress: String(project.progress),
    members: String(project.members),
    tasks: String(project.tasks),
    features: project.features.join("\n"),
  };
}
export function parseDraft(draft: ProjectDraft) {
  const numeric = (value: string) =>
    value.trim() === "" ? NaN : Number(value);
  return ProjectSchema.safeParse({
    ...draft,
    progress: numeric(draft.progress),
    members: numeric(draft.members),
    tasks: numeric(draft.tasks),
    features: draft.features
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
  });
}
export function saveProject(
  records: Project[],
  project: Project,
  originalSlug: string | null,
): Project[] {
  if (
    originalSlug !== null &&
    !records.some((record) => record.slug === originalSlug)
  )
    throw new Error("要编辑的项目不存在");
  if (
    records.some(
      (record) => record.slug === project.slug && record.slug !== originalSlug,
    )
  )
    throw new Error("项目标识已存在，请更换");
  if (originalSlug === null && records.length >= 100)
    throw new Error("演示最多支持 100 个项目");
  return originalSlug === null
    ? [...records, project]
    : records.map((record) =>
        record.slug === originalSlug ? project : record,
      );
}
export async function handleMockMutation(
  request: Request,
  slug?: string,
): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "请求必须为有效 JSON" }, { status: 400 });
  }
  const result = MutationSchema.safeParse(json);
  if (!result.success)
    return Response.json(
      { error: "数据校验失败", issues: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  if (slug !== undefined && result.data.project.slug !== slug)
    return Response.json({ error: "编辑时不能更改项目标识" }, { status: 409 });
  if (result.data.simulateError)
    return Response.json(
      { error: "模拟服务端错误：数据未保存，可取消模拟后重试" },
      { status: 503 },
    );
  return Response.json(
    {
      data: result.data.project,
      meta: { persistence: "client-session-only", serverStored: false },
    },
    {
      status: slug === undefined ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
