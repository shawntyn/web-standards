import { connection } from "next/server";
import { SpecView } from "@repo/render";
import { workbenchSpec } from "@repo/data";
export const metadata = { title: "项目工作台 · Web 工程规范" };
export default async function ProjectsPage() {
  await connection();
  return <SpecView spec={workbenchSpec()} />;
}
