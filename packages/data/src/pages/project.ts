import type { Spec } from "@json-render/core";
import type { Project } from "@repo/domain";
import { projectContentSpec } from "@repo/render/projects";
import { shell } from "../page-shell";

export function projectSpec(project: Project): Spec {
  const content = projectContentSpec(project);
  return shell(content.elements, [content.root]);
}
