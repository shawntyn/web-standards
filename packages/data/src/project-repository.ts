import { ProjectListSchema } from "@repo/domain";
import atlas from "./projects/atlas.json";
import orbit from "./projects/orbit.json";
import field from "./projects/field.json";

// Explicit file manifest: each independently maintained document is validated
// before it crosses the server-to-client boundary. No dynamic path from a URL.
export const projects = ProjectListSchema.parse([atlas, orbit, field]);
export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
