"use client";
import React from "react";
import { defineRegistry, type Components } from "@json-render/react";
import * as UI from "@repo/ui";
import { baseCatalog } from "./base-catalog";
import { CapacityPlanner } from "./components/capacity-planner";
export const baseComponents = {
  ContentList: ({ props }) => <UI.ContentList {...props} />,
  Quote: ({ props }) => <UI.Quote {...props} />,
  ContentTable: ({ props }) => <UI.ContentTable {...props} />,
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
} satisfies Components<typeof baseCatalog>;

export const { registry: baseRegistry } = defineRegistry(baseCatalog, {
  components: baseComponents,
});
