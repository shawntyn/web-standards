import type { Spec } from "@json-render/core";
import { shell } from "../page-shell";
import { node } from "../spec-node";
import { projects } from "../project-repository";
export function workbenchSpec(): Spec {
  return shell(
    {
      title: node("Heading", {
        text: "项目工作台",
        level: 1,
        eyebrow: "MOCK CRUD / REAL HTTP",
      }),
      workbench: node("ProjectWorkbench", {
        initialProjects: projects,
      }),
    },
    ["title", "workbench"],
  );
}
