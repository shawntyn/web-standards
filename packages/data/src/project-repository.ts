import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ProjectListSchema, type Project } from "@repo/domain";

// Next 服务从 apps/web 启动；测试可传入独立目录。
// 每次读取都重新发现文件，URL 参数不参与文件路径拼接。
export async function getProjects(
  directory: string | URL = resolve(
    process.cwd(),
    "../../packages/data/src/projects",
  ),
): Promise<Project[]> {
  const folder =
    directory instanceof URL ? fileURLToPath(directory) : directory;
  const entries = await readdir(folder, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const data = await Promise.all(
    files.map(async (file) => {
      try {
        return JSON.parse(await readFile(join(folder, file), "utf8"));
      } catch (cause) {
        throw new Error(`读取项目 JSON 失败：${file}`, { cause });
      }
    }),
  );
  return ProjectListSchema.parse(data);
}

export function getProject(slug: string, projects: Project[]) {
  return projects.find((project) => project.slug === slug);
}
