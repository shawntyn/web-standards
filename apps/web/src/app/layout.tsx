import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Web Standard | 工程规范", template: "%s | Web Standard" },
  description:
    "可运行的全栈 Web 项目规范，基于 Next.js、Tailwind CSS、pnpm 和 json-render。",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
