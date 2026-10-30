import { SpecView } from "@repo/render";
import { getProjects, homeSpec, validateSpec } from "@repo/data";

export default async function Page() {
  const projects = await getProjects();
  return <SpecView spec={validateSpec(homeSpec(projects))} />;
}
