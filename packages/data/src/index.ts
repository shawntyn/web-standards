import { z } from "zod";
import type { Spec } from "@json-render/core";
import { catalog } from "@repo/render/catalog";
import rawProjects from "./projects.json";
export const ProjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  status: z.string(),
  progress: z.number().min(0).max(100),
  members: z.number().int().positive(),
  tasks: z.number().int().nonnegative(),
  features: z.array(z.string()),
});
export type Project = z.infer<typeof ProjectSchema>;
export const projects = z.array(ProjectSchema).parse(rawProjects);
export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
type Node = Spec["elements"][string];
function node(
  type: string,
  props: Record<string, unknown> = {},
  children: string[] = [],
  slots?: Record<string, string[]>,
): Node {
  return { type, props, children, ...(slots ? { slots } : {}) };
}
export function validateSpec(spec: Spec): Spec {
  const result = catalog.validate(spec);
  if (!result.success) throw result.error;
  if (!spec.elements[spec.root]) throw new Error("Missing root");
  for (const [id, n] of Object.entries(spec.elements)) {
    const definition =
      catalog.data.components[n.type as keyof typeof catalog.data.components];
    if (!definition) throw new Error(`Unknown component ${n.type}`);
    definition.props.parse(n.props);
    for (const ref of [
      ...(n.children ?? []),
      ...Object.values(n.slots ?? {}).flat(),
    ])
      if (!spec.elements[ref])
        throw new Error(`Missing reference ${id} -> ${ref}`);
  }
  return spec;
}
const tree = `web-standards/\n├── apps/\n│   ├── web/        # 主站 + 动态项目详情\n│   └── docs/       # 组件库文档（独立应用）\n├── packages/\n│   ├── ui/         # 自建基础组件与样式\n│   ├── render/     # catalog + registry + slot\n│   └── data/       # JSON / schema / map 转换\n├── tests/          # 数据与渲染协议测试\n└── pnpm-workspace.yaml`;
function shell(
  elements: Record<string, Node>,
  children: string[],
  docs = false,
): Spec {
  return validateSpec({
    root: "frame",
    elements: {
      frame: node(
        "Frame",
        {
          brand: docs ? "UI / 文档中心" : "Web / 工程规范",
          subtitle: docs ? "COMPONENT REFERENCE" : "FULL-STACK REFERENCE",
          links: docs
            ? [
                { label: "组件目录", href: "/" },
                {
                  label: "主站 ↗",
                  href: process.env.WEB_ORIGIN ?? "http://localhost:3000",
                },
              ]
            : [
                { label: "项目示例", href: "/" },
                { label: "架构规范", href: "/standards" },
                {
                  label: "组件文档 ↗",
                  href: process.env.DOCS_ORIGIN ?? "http://localhost:3001",
                },
              ],
        },
        ["page"],
      ),
      page: node("Stack", { gap: "lg" }, children),
      ...elements,
    },
  });
}
export function projectCardsToElements(data: Project[]): Record<string, Node> {
  // Domain JSON -> view protocol. This explicit map is the intentional boundary.
  return Object.fromEntries(
    data.flatMap((project) => {
      const id = `project-${project.slug}`;
      return [
        [
          id,
          node(
            "Card",
            { title: project.name, description: project.description },
            [`${id}-status`],
            { header: [`${id}-category`], footer: [`${id}-link`] },
          ),
        ],
        [`${id}-category`, node("Badge", { text: project.category })],
        [
          `${id}-status`,
          node("Text", {
            text: `${project.members} 位协作者 · ${project.tasks} 条任务`,
            tone: "muted",
          }),
        ],
        [
          `${id}-link`,
          node("LinkButton", {
            label: "查看动态页面",
            href: `/projects/${project.slug}`,
            variant: "secondary",
          }),
        ],
      ] as [string, Node][];
    }),
  );
}
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
        value: "03",
        label: "共享工作区包",
        detail: "UI · Rendering · Domain data",
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
export function projectSpec(project: Project): Spec {
  const featureNodes = Object.fromEntries(
    project.features.map((text, i) => [
      `feature-${i}`,
      node("Badge", { text, tone: "success" }),
    ]),
  );
  return shell(
    {
      back: node("LinkButton", {
        label: "返回所有项目",
        href: "/",
        variant: "secondary",
      }),
      title: node("Heading", {
        text: project.name,
        level: 1,
        eyebrow: `DYNAMIC ROUTE / projects/${project.slug}`,
      }),
      desc: node("Text", { text: project.description, tone: "muted" }),
      metrics: node("Grid", { columns: 3 }, ["m1", "m2", "m3"]),
      m1: node("Metric", { value: `${project.progress}%`, label: "项目进度" }),
      m2: node("Metric", { value: String(project.members), label: "团队成员" }),
      m3: node("Metric", {
        value: project.tasks.toLocaleString("zh-CN"),
        label: "已处理任务",
      }),
      split: node("Split", {}, ["special", "source"]),
      special: node(
        "Card",
        {
          title: "为非通用能力留出空间",
          description:
            "Card 的 header 和 footer 都是 json-render 命名插槽。交互控件来自受信任 registry，不在 JSON 中传函数或 JSX。",
        },
        project.features.map((_, i) => `feature-${i}`),
        { header: ["slot-label"], footer: ["planner"] },
      ),
      "slot-label": node("Badge", {
        text: "NAMED SLOT / footer",
        tone: "accent",
      }),
      planner: node("CapacityPlanner", { initial: project.members }),
      source: node("Code", {
        label: "DOMAIN JSON / 原始业务数据",
        code: JSON.stringify(project, null, 2),
      }),
      ...featureNodes,
      explain: node("Callout", {
        title: "这不是静态导出的页面",
        text: "当前页面使用 await connection() 明确选择请求时渲染，await params 读取动态路由，未知 slug 调用 notFound()。",
      }),
    },
    ["back", "title", "desc", "metrics", "split", "explain"],
  );
}
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
export const componentDocs = [
  {
    slug: "card",
    name: "Card",
    description: "带默认内容与 header / footer 命名插槽的容器。",
  },
  {
    slug: "button",
    name: "LinkButton",
    description: "用语义化链接实现的导航按钮，支持两种视觉层级。",
  },
  {
    slug: "metric",
    name: "Metric",
    description: "结构化指标，区分数值、标签和补充说明。",
  },
  {
    slug: "slot",
    name: "特殊组件 Slot",
    description: "注册表中的受信任交互组件，通过命名插槽接入。",
  },
];
export function docsHomeSpec(): Spec {
  const entries = componentDocs.flatMap(
    (c) =>
      [
        [
          c.slug,
          node("Card", { title: c.name, description: c.description }, [], {
            footer: [c.slug + "-link"],
          }),
        ],
        [
          c.slug + "-link",
          node("LinkButton", {
            label: "组件用法与协议",
            href: `/components/${c.slug}`,
            variant: "secondary",
          }),
        ],
      ] as [string, Node][],
  );
  return shell(
    {
      title: node("Heading", {
        text: "同一种语言，\n构建每一个界面。",
        level: 1,
        eyebrow: "DESIGN SYSTEM / 自建组件库",
      }),
      desc: node("Text", {
        text: "轻量、可理解、不依赖外部 UI 组件库。基础样式与语义组件位于 packages/ui，JSON 协议位于 packages/render。",
        tone: "muted",
      }),
      grid: node(
        "Grid",
        { columns: 2 },
        componentDocs.map((c) => c.slug),
      ),
      ...Object.fromEntries(entries),
      note: node("Callout", {
        title: "文档也是消费者，不是组件源码的家",
        text: "apps/docs 引用共享组件包，并使用相同 json-render 注册表渲染示例；组件实现不放在 docs/app 里。",
      }),
    },
    ["title", "desc", "grid", "note"],
    true,
  );
}
export function componentSpec(slug: string): Spec | undefined {
  const doc = componentDocs.find((c) => c.slug === slug);
  if (!doc) return undefined;
  const preview =
    slug === "button"
      ? node("LinkButton", { label: "示例导航", href: "/", variant: "primary" })
      : slug === "metric"
        ? node("Metric", {
            value: "99.8%",
            label: "服务可用性",
            detail: "展示用静态 mock 数据",
          })
        : node(
            "Card",
            {
              title: "一个可组合的容器",
              description: "组件只关心展示，数据与业务逻辑来自外部。",
            },
            ["body"],
            {
              header: ["label"],
              footer: [slug === "slot" ? "planner" : "link"],
            },
          );
  const exampleElements = {
    preview,
    body: node("Text", { text: "默认 children 插槽中的文本。" }),
    label: node("Badge", { text: "HEADER SLOT", tone: "accent" }),
    link: node("LinkButton", {
      label: "了解更多",
      href: "/",
      variant: "secondary",
    }),
    planner: node("CapacityPlanner", { initial: 24 }),
  };
  return shell(
    {
      back: node("LinkButton", {
        label: "返回组件目录",
        href: "/",
        variant: "secondary",
      }),
      title: node("Heading", {
        text: doc.name,
        level: 1,
        eyebrow: `COMPONENT / ${slug}`,
      }),
      desc: node("Text", { text: doc.description, tone: "muted" }),
      split: node("Split", {}, ["preview", "source"]),
      ...exampleElements,
      source: node("Code", {
        label: "JSON-RENDER SPEC / 实际协议",
        code: JSON.stringify(
          { root: "preview", elements: exampleElements },
          null,
          2,
        ),
      }),
      boundary: node("Callout", {
        title: "显式扩展，而非任意代码执行",
        text: "特殊组件必须在 catalog 声明 props 并在 registry 注册实现。JSON 仅引用组件类型与节点 ID，不接受模块路径、HTML 字符串或执行函数。",
      }),
    },
    ["back", "title", "desc", "split", "boundary"],
    true,
  );
}
