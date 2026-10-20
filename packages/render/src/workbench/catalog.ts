import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";
import { ProjectSchema } from "@repo/domain";
export const workbenchCatalog = defineCatalog(schema, {
  components: {
    WorkbenchNotice: {
      props: z.object({ title: z.string(), text: z.string() }),
    },
    WorkbenchLayout: { props: z.object({}), slots: ["default"] },
    ProjectToolbar: {
      props: z.object({
        query: z.string(),
        status: z.string(),
        busy: z.boolean(),
        ready: z.boolean(),
      }),
    },
    ProjectTable: {
      props: z.object({ count: z.number() }),
      slots: ["default"],
    },
    ProjectRow: { props: ProjectSchema.extend({ busy: z.boolean() }) },
    ProjectEditor: {
      props: z.object({
        editing: z.boolean(),
        busy: z.boolean(),
        simulateError: z.boolean(),
      }),
      slots: ["default"],
    },
    ProjectField: {
      props: z.object({
        name: z.string(),
        label: z.string(),
        value: z.string(),
        type: z.enum(["text", "number", "textarea", "select"]),
        error: z.string().optional(),
        disabled: z.boolean(),
        required: z.boolean(),
        description: z.string().optional(),
      }),
    },
    ProjectFeedback: {
      props: z.object({ message: z.string(), error: z.boolean() }),
    },
    ProjectDetail: { props: ProjectSchema },
  },
  actions: {},
});
