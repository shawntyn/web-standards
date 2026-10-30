import type { Spec } from "@json-render/core";
import type { Project } from "@repo/domain";

export function homeSpec(projects: Project[]): Spec {
  // 首页摘要：每个项目一张卡片和一个详情链接。
  const projectElements: Spec["elements"] = {};
  for (const project of projects) {
    const cardId = `project-card-${project.slug}`;
    const linkId = `project-link-${project.slug}`;
    projectElements[cardId] = {
      type: "Card",
      props: { title: project.name, description: project.description },
      children: [linkId],
    };
    projectElements[linkId] = {
      type: "Button",
      props: {
        label: `打开 ${project.name}`,
        href: `/projects/${project.slug}`,
      },
      children: [],
    };
  }

  return {
    root: "home",
    elements: {
      home: {
        type: "Stack",
        props: { gap: "lg" },
        children: ["title", "intro", "projects-title", "projects"],
      },
      title: {
        type: "Heading",
        props: { text: "从数据到页面", level: 1 },
        children: [],
      },
      intro: {
        type: "Text",
        props: { text: "选择一个小项目，看看 JSON 怎样一步步变成页面。" },
        children: [],
      },
      "projects-title": {
        type: "Heading",
        props: { text: "项目详情", level: 2 },
        children: [],
      },
      projects: {
        type: "Grid",
        props: { columns: 2 },
        children: projects.map((project) => `project-card-${project.slug}`),
      },
      ...projectElements,
    },
  };
}
