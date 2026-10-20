"use client";
import React, { useState } from "react";
import { Renderer, defineRegistry, JSONUIProvider } from "@json-render/react";
import type { Spec } from "@json-render/core";
import * as UI from "@repo/ui";
import { catalog } from "./catalog";
function CapacityPlanner({ initial }: { initial: number }) {
  const [capacity, setCapacity] = useState(initial);
  return (
    <div className="slot-widget">
      <label htmlFor="capacity-input">
        <span>团队容量 / 特殊组件插槽</span>
        <strong>{capacity} 人</strong>
      </label>
      <input
        id="capacity-input"
        type="range"
        min="1"
        max="100"
        value={capacity}
        onChange={(e) => setCapacity(Number(e.target.value))}
      />
      <div className="slot-bar">
        <span style={{ width: `${capacity}%` }} />
      </div>
      <p aria-live="polite">
        预计每月处理 {(capacity * 120).toLocaleString("zh-CN")}{" "}
        条任务。仅此组件持有本地交互状态。
      </p>
    </div>
  );
}
export const { registry } = defineRegistry(catalog, {
  components: {
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
// This Client Component is pre-rendered into HTML by Next.js on the server.
// Never use dynamic(..., { ssr:false }) here. JSON is the only boundary payload.
export function SpecView({ spec }: { spec: Spec }) {
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
