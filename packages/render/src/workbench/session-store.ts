import { ProjectListSchema, STORAGE_KEY, type Project } from "@repo/domain";
export function readSessionProjects(initialProjects: Project[]): {
  records: Project[];
  warning: string;
} {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return { records: initialProjects, warning: "" };
    const parsed = ProjectListSchema.safeParse(JSON.parse(saved));
    if (
      parsed.success &&
      new Set(parsed.data.map((project) => project.slug)).size ===
        parsed.data.length
    )
      return { records: parsed.data, warning: "" };
    return {
      records: initialProjects,
      warning: "已忽略无效的会话数据，使用初始 JSON。",
    };
  } catch {
    return {
      records: initialProjects,
      warning: "浏览器会话存储不可用；更改仅保留到本页刷新前。",
    };
  }
}
export function persistSessionProjects(records: Project[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return "";
  } catch {
    return "（会话存储不可用，刷新后会丢失本次更改）";
  }
}
