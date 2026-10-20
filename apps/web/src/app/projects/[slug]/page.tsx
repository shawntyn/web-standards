import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SpecView } from "@repo/render";
import { getProject, projectSpec } from "@repo/data";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project?.name ?? "项目未找到" };
}
export default async function Page({ params }: Props) {
  await connection();
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <SpecView spec={projectSpec(project)} />;
}
