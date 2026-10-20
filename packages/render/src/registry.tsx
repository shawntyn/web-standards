"use client";
import React from "react";
import { defineRegistry } from "@json-render/react";
import { catalog } from "./catalog";
import { baseComponents } from "./base-registry";
import { ProjectWorkbench } from "./workbench/project-workbench";

export const { registry } = defineRegistry(catalog, {
  components: {
    ...baseComponents,
    ProjectWorkbench: ({ props }) => <ProjectWorkbench {...props} />,
  },
});
