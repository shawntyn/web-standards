"use client";
import React from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import type { Project } from "@repo/domain";
import { baseRegistry } from "../base-registry";
import { projectContentSpec } from "./project-content-spec";

/** Document-only registry: no dependency back to the workbench/app registry. */
export function ProjectSpecViewRender({ project }: { project: Project }) {
  return (
    <JSONUIProvider registry={baseRegistry}>
      <Renderer spec={projectContentSpec(project)} registry={baseRegistry} />
    </JSONUIProvider>
  );
}
