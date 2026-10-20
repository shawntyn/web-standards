import type { Spec } from "@json-render/core";
import { shell } from "../page-shell";
import { node } from "../spec-node";
import { tree } from "../architecture";
import { projects } from "../project-repository";
import { projectCardsToElements } from "../mapping/project-cards";
export function homeSpec(): Spec {
  return shell(
    {
      hero: node("Split", {}, ["intro", "architecture"]),
      intro: node("Stack", { gap: "md" }, ["eyebrow", "title", "lead", "cta"]),
      eyebrow: node("Badge", {
        text: "REFERENCE IMPLEMENTATION · 2026",
        tone: "accent",
      }),
      title: node("Heading", { text: "好的规范，\n应该可以运行。", level: 1 }),
      lead: node("Text", {
        text: "不是一份停留在纸面的约定，而是一个可阅读、可测试、可扩展的全栈 Web 工程。每一层都有清晰的职责，每一个页面都有真实的数据路径。",
        tone: "muted",
      }),
      cta: node("LinkButton", { label: "探索工程规范", href: "/standards" }),
      architecture: node("Code", { code: tree, label: "WORKSPACE / MONOREPO" }),
      metrics: node("Grid", { columns: 3 }, ["m1", "m2", "m3"]),
      m1: node("Metric", {
        value: "02",
        label: "独立 Next.js 应用",
        detail: "主站与组件文档，各自构建和部署",
      }),
      m2: node("Metric", {
        value: "04",
        label: "共享工作区包",
        detail: "UI · Rendering · Domain · Data",
      }),
      m3: node("Metric", {
        value: "100%",
        label: "Spec 驱动展示",
        detail: "业务 JSON → map → json-render",
      }),
      projectsTitle: node("Heading", {
        text: "从数据走到页面",
        level: 2,
        eyebrow: "LIVE EXAMPLES / 动态路由",
      }),
      projects: node(
        "Grid",
        { columns: 3 },
        projects.map((p) => `project-${p.slug}`),
      ),
      ...projectCardsToElements(projects),
      flow: node("Callout", {
        title: "服务端处理数据，客户端只负责交互",
        text: "动态路由在服务器读取本地 JSON、校验并转换为 Spec。json-render 在首个 HTML 中输出内容，再为特殊交互组件 hydration。没有客户端数据瀑布。",
      }),
    },
    ["hero", "metrics", "projectsTitle", "projects", "flow"],
  );
}
