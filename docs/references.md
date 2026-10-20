# 官方规范与架构决策

核验日期：2026-10-20。版本以当天 npm registry 的 `latest` dist-tag 为依据，不使用日期推测版本。已核验：Next.js 16.4.2、Tailwind CSS 4.3.3、pnpm 12.14.0、@json-render/react 0.21.1。实际安装版本以根 package.json、各包 package.json 和 pnpm-lock.yaml 为准；不要在文档中把未来的“最新版本”作为永久保证。

## Workspace 不是路由分组

采用 `apps/web` 与 `apps/docs`，因为主站和组件文档是两个独立应用，有独立的入口、配置、运行端口和部署生命周期。`packages/ui` 放自研 React 模板组件，`packages/render` 放 catalog、registry、JSON 渲染边界及 spec 转换逻辑；共享配置可独立成包。

`app/(group)` 仅在同一个 Next.js 应用内组织路由、共享布局，不会产生独立应用，也不改变 URL。这里分成两个 apps 是针对项目目标的设计选择，而非 Next.js 强制唯一目录规范。每个应用内仍可使用 `src/app` 和路由分组。

- [pnpm Workspace：根 pnpm-workspace.yaml 与 workspace: 协议](https://pnpm.io/workspaces)
- [Next.js 项目结构：App Router、src、动态段和路由组](https://nextjs.org/docs/app/getting-started/project-structure)

## 服务端页面与 JSON Renderer 边界

Next.js 页面及布局默认使用 Server Components。动态路由页面对 `params: Promise<{ slug: string }>` 使用 `await params`，服务端读取静态 mock JSON，完成领域数据校验和 spec 转换后，仅传可序列化数据到渲染入口。动态路径不自动意味着每请求 SSR；若要明确演示请求时渲染，可在服务端页面使用 `await connection()`，并验证响应 HTML 包含实际内容。

json-render React Renderer 使用客户端运行时，但 Next.js 首次加载仍可以预渲染 Client Components 的 HTML。因此 `'use client'` 不等于纯 CSR。不要使用 `ssr: false`，不要把 mock 加载搬进浏览器 effect，也不要把函数 registry 当 Server→Client props 传递。

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js 异步动态 API](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js connection：显式请求时渲染](https://nextjs.org/docs/app/api-reference/functions/connection)

## Tailwind CSS 4

Next.js 使用 `@tailwindcss/postcss`，全局样式采用 `@import "tailwindcss"`。共享组件源文件位于应用目录以外时，应显式通过 `@source` 纳入扫描；路径相对声明该指令的 CSS 文件计算。不要套用 Tailwind 3 的初始化模板。颜色、间距等 token 可用 CSS-first 的 `@theme`。变体类使用完整字面量映射，避免动态拼接无法被扫描的类名。

- [Tailwind CSS 官方 Next.js 安装](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Tailwind source detection 与 @source](https://tailwindcss.com/docs/detecting-classes-in-source-files)

## json-render：真实 API 与 slot

使用官方包，而非自行实现同名 Renderer：

- `defineCatalog` 来自 `@json-render/core`；React `schema` 来自 `@json-render/react/schema`。
- `defineRegistry(catalog, { components })` 来自 `@json-render/react`，返回 `registry`。
- `<Renderer spec={spec} registry={registry} />` 消费扁平 spec：顶层 `root` 指向 `elements` 中的节点 ID。
- 各节点包含 `type`、`props`、`children`；`children` 是默认 slot 的节点 ID 数组。
- 命名 slot 在 catalog 声明，例如 `slots: ["default", "header", "aside"]`。spec 用 `slots: { aside: ["special-preview"] }` 引用节点；registry 实现从 `slots?.aside` 读取已渲染的 ReactNode。
- 特殊组件仍先注册进 catalog/registry，再由 slot 引用，避免绕过 JSON 结构直接塞 JSX。

把 mock 中的领域对象数组 `.map()` 成带稳定 ID 的元素键值对，再用 `Object.fromEntries()` 形成 `elements`；同时 `.map()` 生成父节点 `children`，是业务数据到 UI spec 的显式适配，而不是简单把 JSON 文本显示出来。保留输入 mock、转换函数和输出 spec 三者可对照的示例。

- [Catalog 与基础用法](https://json-render.dev/docs)
- [Registry：类型推导与命名 slots](https://json-render.dev/docs/registry)
- [Spec：root/elements、children 与 slots](https://json-render.dev/docs/specs)
- [React API：Renderer 与 providers](https://json-render.dev/docs/api/react)

## 可选集成的边界

`@json-render/next` 提供由 JSON 描述整个 routes/layouts 的 `createNextApp`、`NextAppProvider` 等集成，适合全应用 JSON 路由方案；不是 Next.js 使用 json-render 或实现 SSR 的必要条件。本项目保留原生 App Router 文件系统路由，更方便展示 Next.js 的目录约定。不要混淆该集成的内置布局 `Slot` 与 React renderer 的 named slots。

- [官方 @json-render/next API](https://json-render.dev/docs/api/next)
