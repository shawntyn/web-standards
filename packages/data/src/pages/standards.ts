import type { Spec } from "@json-render/core";
import { shell } from "../page-shell";
import { node } from "../spec-node";
import { tree } from "../architecture";
export function standardsSpec(): Spec {
  return shell(
    {
      title: node("Heading", {
        text: "清晰边界，比目录数量更重要。",
        level: 1,
        eyebrow: "ARCHITECTURE / 规范说明",
      }),
      split: node("Split", {}, ["tree", "steps"]),
      tree: node("Code", { code: tree, label: "APPLICATION BOUNDARIES" }),
      steps: node("Steps", {
        items: [
          {
            title: "apps 是部署边界",
            description:
              "主站与组件文档拥有不同的导航、构建产物和发布周期，所以使用 apps/web 与 apps/docs。",
          },
          {
            title: "route groups 不是应用",
            description:
              "app/(group) 只组织同一个 Next 应用里的布局，不创建独立部署，不能代替 workspace。",
          },
          {
            title: "packages 是依赖边界",
            description:
              "ui 只负责展示；render 定义协议与注册表；data 维护业务数据和明确的转换函数。",
          },
          {
            title: "验证先于渲染",
            description:
              "Zod 校验业务 JSON，Catalog 约束组件 props，测试检查节点引用与动态路由的 404。",
          },
        ],
      }),
      mapping: node("Code", {
        label: "EXPLICIT MAP / 业务数据 → Spec",
        code: `const elements = Object.fromEntries(\n  projects.map(project => [\n    'project-' + project.slug,\n    { type: 'Card', props: { title: project.name },\n      children: [], slots: { footer: ['link-' + project.slug] } }\n  ])\n);\n// 完整转换函数还生成 footer 引用的 LinkButton 节点。`,
      }),
      rules: node("Callout", {
        title: "不把「最新」当作浮动依赖",
        text: "本项目核验最新稳定版后固定版本，并提交 pnpm-lock.yaml。升级通过独立变更和完整测试，生产安装使用 --frozen-lockfile。",
      }),
    },
    ["title", "split", "mapping", "rules"],
  );
}
