"use client";
import React from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry } from "./registry";
// This Client Component is pre-rendered into HTML by Next.js on the server.
// Never use dynamic(..., { ssr:false }) here. JSON is the only boundary payload.
export function SpecView({ spec }: { spec: Spec }) {
  return (
    <JSONUIProvider registry={registry}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
