import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { getProjects } from "@repo/data";
import { AppShell } from "@repo/ui";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Web Standard | 从数据到页面",
    template: "%s | Web Standard",
  },
  description:
    "项目列表与动态详情：本地 JSON 经校验和转换，通过 json-render 输出页面。",
};
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const projects = await getProjects();
  return (
    <html lang="zh-CN">
      <body>
        <AppShell
          brand="Web Standard"
          links={[
            { label: "首页", href: "/" },
            ...projects.map((project) => ({
              label: project.name,
              href: `/projects/${project.slug}`,
            })),
          ]}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
