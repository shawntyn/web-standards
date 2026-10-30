"use client";
import React from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry } from "./registry";
// Next.js 仍会在服务器预渲染此客户端组件，跨边界传入的数据只有 Spec。
export function SpecView({ spec }: { spec: Spec }) {
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
