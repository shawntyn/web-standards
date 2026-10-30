"use client";
import React from "react";
import { defineRegistry } from "@json-render/react";
import * as UI from "@repo/ui";
import { catalog } from "./catalog";

// Spec 的 type 在这里对应到实际 React 组件；组件只接收普通 props。
export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children }) => <UI.Stack {...props}>{children}</UI.Stack>,
    Grid: ({ props, children }) => <UI.Grid {...props}>{children}</UI.Grid>,
    Heading: ({ props }) => <UI.Heading {...props} />,
    Text: ({ props }) => <UI.Text {...props} />,
    Card: ({ props, children, slots }) => (
      <UI.Card {...props} header={slots?.header} footer={slots?.footer}>
        {children}
      </UI.Card>
    ),
    Button: ({ props }) => <UI.Button {...props} />,
    List: ({ props }) => <UI.List {...props} />,
    Table: ({ props }) => <UI.Table {...props} />,
  },
});
