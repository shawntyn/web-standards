import type { Spec } from "@json-render/core";
import { node } from "../spec-node";
import { projects } from "../project-repository";
import { projectCardsToElements } from "../mapping/project-cards";

export function homeSpec(): Spec {
  return {
    root: "home",
    elements: {
      home: node("Stack", { gap: "lg" }, [
        "title",
        "intro",
        "projects-title",
        "projects",
        "analytics",
      ]),
      title: node("Heading", { text: "从数据到页面", level: 1 }),
      intro: node("Text", {
        text: "两个小项目，一份渠道统计。选择一个示例开始阅读。",
      }),
      "projects-title": node("Heading", { text: "项目详情", level: 2 }),
      projects: node(
        "Grid",
        { columns: 2 },
        projects.map((project) => `project-${project.slug}`),
      ),
      ...projectCardsToElements(projects),
      analytics: node(
        "Card",
        {
          title: "渠道统计",
          description: "三条订单记录，也可以切换到空数据。",
        },
        ["analytics-links"],
      ),
      "analytics-links": node("Grid", { columns: 2 }, ["commerce", "empty"]),
      commerce: node("LinkButton", {
        label: "查看订单数据",
        href: "/analytics/commerce",
      }),
      empty: node("LinkButton", {
        label: "查看空数据",
        href: "/analytics/empty",
      }),
    },
  };
}
