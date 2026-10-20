import type { Project } from "@repo/domain";
import { node, type Node } from "../spec-node";
export function projectCardsToElements(data: Project[]): Record<string, Node> {
  // Domain JSON -> view protocol. This explicit map is the intentional boundary.
  return Object.fromEntries(
    data.flatMap((project) => {
      const id = `project-${project.slug}`;
      return [
        [
          id,
          node(
            "Card",
            { title: project.name, description: project.description },
            [`${id}-status`],
            { header: [`${id}-category`], footer: [`${id}-link`] },
          ),
        ],
        [`${id}-category`, node("Badge", { text: project.category })],
        [
          `${id}-status`,
          node("Text", {
            text: `${project.members} 位协作者 · ${project.tasks} 条任务`,
            tone: "muted",
          }),
        ],
        [
          `${id}-link`,
          node("LinkButton", {
            label: "查看动态页面",
            href: `/projects/${project.slug}`,
            variant: "secondary",
          }),
        ],
      ] as [string, Node][];
    }),
  );
}
