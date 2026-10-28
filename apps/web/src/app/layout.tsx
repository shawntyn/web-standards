import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Web Standard | 从数据到页面",
    template: "%s | Web Standard",
  },
  description:
    "首页与两个项目详情：本地 JSON 经校验和转换，通过 json-render 输出页面。",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
