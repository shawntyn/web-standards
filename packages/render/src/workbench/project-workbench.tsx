"use client";
import React from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import type { Project } from "@repo/domain";
import { WorkbenchContext } from "./context";
import { workbenchToSpec } from "./mapping";
import { workbenchRegistry } from "./registry";
import { useProjectWorkbench } from "./use-project-workbench";
export function ProjectWorkbench({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const { view, actions, container } = useProjectWorkbench(initialProjects);
  return (
    <WorkbenchContext.Provider value={actions}>
      <div ref={container} className="space-y-6">
        <JSONUIProvider registry={workbenchRegistry}>
          <Renderer spec={workbenchToSpec(view)} registry={workbenchRegistry} />
        </JSONUIProvider>
      </div>
    </WorkbenchContext.Provider>
  );
}
