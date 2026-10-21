export { ProjectSchema, type Project } from "@repo/domain";
export { projects, getProject } from "./project-repository";
export { validateSpec } from "./validate-spec";
export { projectCardsToElements } from "./mapping/project-cards";
export { homeSpec } from "./pages/home";
export { standardsSpec } from "./pages/standards";
export { projectSpec } from "./pages/project";
export { workbenchSpec } from "./pages/workbench";

export { queryAnalytics } from "./analytics/repository";
export { analyticsToSpec, analyticsDisplay } from "./analytics/mapping";
export { QueryResultSchema } from "./analytics/query-schema";
export { analyticsSpec } from "./pages/analytics";
