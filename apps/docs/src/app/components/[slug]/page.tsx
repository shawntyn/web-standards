import { connection } from "next/server";
import { notFound } from "next/navigation";
import { SpecView } from "@repo/render";
import { componentSpec } from "@repo/data";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const spec = componentSpec(slug);
  if (!spec) notFound();
  return <SpecView spec={spec} />;
}
