import { connection } from "next/server";
import type { Spec } from "@json-render/core";
import { SpecView } from "@repo/render";
import { preparePreviewSpec } from "../lib/preview-spec";
import { documents } from "../lib/documents";

export default async function Page() {
  await connection();
  const cards = documents.map(
    ({ slug, title, description }) =>
      [
        slug,
        {
          type: "Card",
          props: { title, description },
          slots: { footer: [`${slug}-link`] },
        },
      ] as const,
  );
  const links = documents.map(
    ({ slug, title }) =>
      [
        `${slug}-link`,
        {
          type: "LinkButton",
          props: {
            label: `阅读 ${title}`,
            href: `/components/${slug}`,
            variant: "secondary",
          },
        },
      ] as const,
  );
  const spec: Spec = {
    root: "frame",
    elements: {
      frame: {
        type: "Frame",
        props: {
          brand: "WEB STANDARD",
          subtitle: "组件文档 / MDX",
          links: [
            { label: "组件目录", href: "/" },
            { label: "完整流程", href: "/components/workflow" },
          ],
        },
        children: ["title", "description", "grid", "boundary"],
      },
      title: {
        type: "Heading",
        props: {
          text: "可运行的组件规范。",
          level: 1,
          eyebrow: "TAILWIND CSS / MDX / JSON-RENDER",
        },
      },
      description: {
        type: "Text",
        props: {
          text: "每个组件一个源文件；正文使用本地 MDX，实际示例使用同一 json-render 注册表。",
        },
      },
      grid: {
        type: "Grid",
        props: { columns: 2 },
        children: documents.map((doc) => doc.slug),
      },
      boundary: {
        type: "Callout",
        props: {
          title: "文档与主站分别部署",
          text: "apps/docs 维护 MDX 文档；apps/web 展示完整 SSR 与编辑工作流。共享组件和协议留在 packages 中。",
        },
      },
      ...Object.fromEntries(cards),
      ...Object.fromEntries(links),
    },
  };
  return <SpecView spec={preparePreviewSpec(spec)} />;
}
