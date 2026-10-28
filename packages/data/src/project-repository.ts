import { ProjectListSchema } from "@repo/domain";
import atlas from "./projects/atlas.json";
import orbit from "./projects/orbit.json";

// 静态文件清单；URL 参数只用于查找，不参与拼接文件路径。
export const projects = ProjectListSchema.parse([atlas, orbit]);
export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
