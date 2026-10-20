import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { SpecView } from "@repo/render";
import { getDocument } from "../../../lib/documents";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getDocument((await params).slug);
  return { title: doc?.title ?? "文档不存在", description: doc?.description };
}
export default async function Page({ params }: Props) {
  await connection();
  const doc = getDocument((await params).slug);
  if (!doc) notFound();
  const Content = doc.Content;
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <nav aria-label="文档导航" className="mb-10">
        <SpecView
          spec={{
            root: "back",
            elements: {
              back: {
                type: "LinkButton",
                children: [],
                props: {
                  label: "返回组件目录",
                  href: "/",
                  variant: "secondary",
                },
              },
            },
          }}
        />
      </nav>
      <article>
        <Content />
      </article>
    </main>
  );
}
