import type { Project } from "@repo/domain";
import { node, type Node } from "../spec-node";

// 首页摘要有明确的固定视图：每个项目一张卡片和一个详情链接。
export function projectCardsToElements(
  projects: Project[],
): Record<string, Node> {
  return Object.fromEntries(
    projects.flatMap((project) => {
      const id = `project-${project.slug}`;
      return [
        [
          id,
          node(
            "Card",
            { title: project.name, description: project.description },
            [`${id}-link`],
          ),
        ],
        [
          `${id}-link`,
          node("LinkButton", {
            label: `打开 ${project.name}`,
            href: `/projects/${project.slug}`,
          }),
        ],
      ] as [string, Node][];
    }),
  );
}
