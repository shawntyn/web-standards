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
      ]),
      title: node("Heading", { text: "从数据到页面", level: 1 }),
      intro: node("Text", {
        text: "选择一个小项目，看看 JSON 怎样一步步变成页面。",
      }),
      "projects-title": node("Heading", { text: "项目详情", level: 2 }),
      projects: node(
        "Grid",
        { columns: 2 },
        projects.map((project) => `project-${project.slug}`),
      ),
      ...projectCardsToElements(projects),
    },
  };
}
