import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getAnalytics, analyticsToSpec, pageSpec } from "@repo/data";
import { SpecView } from "@repo/render";

export const metadata = { title: "渠道统计" };
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const data = getAnalytics(slug);
  if (!data) notFound();
  const content = analyticsToSpec(data);
  return <SpecView spec={pageSpec(content)} />;
}
