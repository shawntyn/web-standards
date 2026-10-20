import type { Spec } from "@json-render/core";
import type { Project } from "@repo/domain";
import { projectContentSpec } from "@repo/render/projects";
import { validateSpec } from "../validate-spec";

/** No page template or application chrome is injected into project content. */
export function projectSpec(project: Project): Spec {
  return validateSpec(projectContentSpec(project));
}
