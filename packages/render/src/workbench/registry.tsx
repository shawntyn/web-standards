import React from "react";
import { Callout } from "@repo/ui";
import { defineRegistry } from "@json-render/react";
import { workbenchCatalog } from "./catalog";
import { ProjectToolbar } from "./project-toolbar";
import { ProjectTable } from "./project-table";
import { ProjectRow } from "./project-row";
import { ProjectEditor } from "./project-editor";
import { ProjectField } from "./project-field";
import { ProjectFeedback } from "./project-feedback";
import { ProjectDetail } from "./project-detail";
export const { registry: workbenchRegistry } = defineRegistry(
  workbenchCatalog,
  {
    components: {
      WorkbenchNotice: ({ props }) => <Callout {...props} />,
      WorkbenchLayout: ({ children }) => (
        <div className="space-y-6">{children}</div>
      ),
      ProjectToolbar: ({ props }) => <ProjectToolbar {...props} />,
      ProjectTable: ({ props, children }) => (
        <ProjectTable {...props}>{children}</ProjectTable>
      ),
      ProjectRow: ({ props }) => <ProjectRow {...props} />,
      ProjectEditor: ({ props, children }) => (
        <ProjectEditor {...props}>{children}</ProjectEditor>
      ),
      ProjectField: ({ props }) => <ProjectField {...props} />,
      ProjectFeedback: ({ props }) => <ProjectFeedback {...props} />,
      ProjectDetail: ({ props }) => <ProjectDetail {...props} />,
    },
  },
);
