import type { Project } from "./project-schema";
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
