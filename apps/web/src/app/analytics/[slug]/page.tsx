import { connection } from "next/server";
import { notFound } from "next/navigation";
import { queryAnalytics, analyticsSpec } from "@repo/data";
import { SpecView } from "@repo/render";
export const metadata = { title: "数据渲染实验室" };
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const rows = await queryAnalytics(slug);
  if (!rows) notFound();
  return <SpecView spec={analyticsSpec(rows)} />;
}
