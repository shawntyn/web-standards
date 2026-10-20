import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";
import { ProjectListSchema } from "@repo/domain";
import { baseCatalog } from "./base-catalog";

export const catalog = defineCatalog(schema, {
  components: {
    ...baseCatalog.data.components,
    ProjectWorkbench: {
      props: z.object({ initialProjects: ProjectListSchema }),
      description: "真实 HTTP 校验与标签页隔离的 Mock CRUD 工作台",
    },
  },
  actions: {},
});
