import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SpecView } from "@repo/render";
import { contentToSpec } from "@repo/render/content";
import { getProjects, getProject, validateSpec } from "@repo/data";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug, await getProjects());
  return { title: project?.name ?? "项目未找到" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug, await getProjects());
  if (!project) notFound();
  const contentSpec = contentToSpec(project.content);
  return <SpecView spec={validateSpec(contentSpec)} />;
}
