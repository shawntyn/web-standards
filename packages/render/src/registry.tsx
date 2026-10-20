"use client";
import React from "react";
import { defineRegistry } from "@json-render/react";
import * as UI from "@repo/ui";
import { catalog } from "./catalog";
import { ProjectWorkbench } from "./workbench/project-workbench";
import { CapacityPlanner } from "./components/capacity-planner";
export const { registry } = defineRegistry(catalog, {
  components: {
    ProjectWorkbench: ({ props }) => <ProjectWorkbench {...props} />,
    Frame: ({ props, children }) => <UI.Frame {...props}>{children}</UI.Frame>,
    Stack: ({ props, children }) => <UI.Stack {...props}>{children}</UI.Stack>,
    Split: ({ children }) => <UI.Split>{children}</UI.Split>,
    Grid: ({ props, children }) => <UI.Grid {...props}>{children}</UI.Grid>,
    Heading: ({ props }) => <UI.Heading {...props} />,
    Text: ({ props }) => <UI.Text {...props} />,
    Badge: ({ props }) => <UI.Badge {...props} />,
    Card: ({ props, children, slots }) => (
      <UI.Card {...props} header={slots?.header} footer={slots?.footer}>
        {children}
      </UI.Card>
    ),
    LinkButton: ({ props }) => <UI.LinkButton {...props} />,
    Code: ({ props }) => <UI.Code {...props} />,
    Metric: ({ props }) => <UI.Metric {...props} />,
    Callout: ({ props }) => <UI.Callout {...props} />,
    Steps: ({ props }) => <UI.Steps {...props} />,
    CapacityPlanner: ({ props }) => <CapacityPlanner {...props} />,
  },
});
