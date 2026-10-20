# Web Standard

可运行的全栈 Web 规范参考实现。不是完整业务系统：数据持久化、身份认证和部署基础设施明确不在本示例范围内。

## 在线预览

- 主站：https://web-standards-next-demo.shawntyn.chatgpt.site
- 组件文档：https://web-standards-ui-docs.shawntyn.chatgpt.site

两个预览站均为 owner-private，仅项目所有者登录 ChatGPT 后可访问。公开的是本仓库源码，不代表预览站已开放匿名访问。

## 技术与版本

2026-10-20 查询 npm registry 的稳定版本：Next.js 16.4.2、React 19.3.1、Tailwind CSS 4.3.3、json-render 0.21.1、pnpm 12.14.0。实际依赖通过 `pnpm-lock.yaml` 固定，禁止在部署时隐式升级。

TypeScript 固定为 6.0.3：当前 typescript-eslint 8.71.2 明确不支持 TS 7 API，因此采用兼容编译器，而不是跳过 lint 或类型检查。见 [TypeScript 官方说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0)。

要求 Node.js 24+。推荐用 Corepack 或 pnpm 官方安装方式准备项目指定的 pnpm 版本。

```sh
pnpm install --frozen-lockfile
pnpm dev
# 主站 http://localhost:3000
# 组件文档 http://localhost:3001
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:http  # 启动两个生产服务，检查 SSR / 404 / mock API，然后退出
pnpm --filter @repo/web start
pnpm --filter @repo/docs start
```

## 为什么是 apps/web + apps/docs，而不是 app/(web) + app/(docs)

两站有独立的导航、部署、构建产物和生命周期，采用两个 Next.js workspace。Route Group `(group)` 只是在一个应用中组织布局，不创建独立应用或部署边界。若未来两站必须共用单一部署和路由，再使用 route group；它不是 monorepo 的替代品。

```text
apps/
  web/src/app/
    page.tsx
    standards/page.tsx
    projects/[slug]/page.tsx
    api/projects/route.ts
  docs/src/app/
    page.tsx
    components/[slug]/page.tsx
packages/
  ui/src/components/ 每个基础组件一个文件，无外部 UI 库
  ui/src/index.ts    仅 barrel exports
  ui/src/styles.css  Tailwind theme tokens + 全局 base
  render/src/       catalog、typed registry、官方 Renderer、特殊组件
  domain/src/       内容 / 项目 schema、草稿转换、mock HTTP 校验
  data/src/projects/atlas.json  产品说明
  data/src/projects/orbit.json  编辑手记
  data/src/projects/field.json  分析报告
  data/src/pages/   页面组合，index.ts 仅导出
 tests/             数据契约、引用完整性、真实 SSR 检查
```

依赖方向：apps → data / render；data → render/catalog 与 render/projects（纯转换器）；render → domain / ui；ui 不依赖应用、业务数据或 json-render。所有 workspace 使用 `workspace:*` 和显式 exports，不通过相对路径跨包导入。测试可以直接定位被测源码。

## 完整渲染路径

1. Next.js 异步 Server Page 用 `await connection()` 明确请求时动态渲染。
2. 动态路由 `params` 是 Promise，必须 `await params`。
3. 读取 `projects/` 下逐项目独立的 JSON 文件，使用 Zod 校验业务结构；未知 slug 调用 `notFound()`。
4. `projectContentSpec()` 用 `content.map(mapContentBlock)` 将有序领域内容转换为节点字典与 children 顺序。首页摘要另由 `projectCardsToElements()` 转换。这不是把业务 JSON 直接当 UI Spec。
5. `catalog.validate(spec)` 校验组件和 props，额外检查所有节点引用存在。
6. 将可序列化 Spec 传给 `SpecView`。它直接使用官方 `@json-render/react` 的 `JSONUIProvider`、`Renderer` 和 `defineRegistry`。
7. Next.js 对 Client Component 首次请求仍预渲染 HTML，然后 hydration；`'use client'` 不等于 CSR。本项目不使用 `ssr:false` 或空壳替代 SSR，首屏读取不依赖客户端 fetch；工作台写操作通过真实 HTTP 提交。

页面的组件树、内容、导航与文档组件预览均通过 Spec 进入 Renderer。文档正文由本地 MDX 编译。Next.js 的根文档 `<html>/<body>` 是框架必要边界，不是用 JSON 描述文档本身。

## 内容驱动，而非重复的详情模板

三个示例各自一个 JSON 文件，使用共享的类型安全内容协议，但有不同的内容块与顺序：Atlas 为产品说明，Orbit 为编辑手记，Field 为分析报告。正文只呈现作者提供的内容，不固定插入三张指标卡、源码 JSON 或技术说明。

`packages/domain/src/content.ts` 定义 paragraph / heading / list / quote / code / table / callout / capacity-plan 判别联合。每块稳定 ID 唯一，未知类型、额外属性、表格行宽不符均拒绝。`packages/render/src/projects/project-content-spec.ts` 是唯一正文映射器；`ProjectSpecViewRender` 与 SSR 页面共用它。调整段落顺序、删块或新增已有类型的块，只改内容文件，无需修改 TypeScript 模板。

正文采用约 72ch 的 `Document` 阅读容器。特殊容量工具仅在 Atlas 的 `capacity-plan` 块中，通过 `ContentSection` 的 `interactive` 命名 slot 接入，不强迫每篇文档出现相同工具。数据中仍不允许 JSX、函数、任意模块路径或 HTML 注入。

工作台可编辑同一份正文 JSON，保留内容并共享客户端与服务端校验；成功后会话详情使用相同渲染器更新。它是协议编辑器，不是富文本编辑器。会话存储 key 升为 v2，旧结构不混入新数据。

职责按文件拆分：data 的仓储 / mapper / page / shell / 校验分开；domain 的内容契约 / 项目契约 / 草稿 / 集合更新 / HTTP 服务分开；workbench 的状态 hook / session store / 字段定义 / 展示组件分开。只用于旧文档样例的重复定义已经删除，组件文档以 apps/docs 的本地 MDX 为唯一来源。

## Catalog / Registry / Spec

- `catalog.ts`：Zod props 契约，以及允许的 default/header/footer slot。
- `registry.tsx`：受信任组件实现的注册表；没有动态 import 任意路径或执行 JSON 内代码。
- `Spec`：`{ root, elements }`，节点 `type` 指向组件名，children/slots 存节点 ID。
- UI 包：语义化 React 组件，只接普通 props 和 ReactNode；不了解 json-render。

## 特殊组件 slot

`Card` 在 Catalog 声明 `slots: ['default','header','footer']`。Registry 通过 `slots?.header` 和 `slots?.footer` 显式传给基础 Card。组件文档的 Card 示例 footer 指向 `CapacityPlanner` 节点，它是代码中预注册的可交互组件，JSON 只提供初始数值。

此例展示允许业务扩展而不污染通用 UI 的方法。不要把函数、JSX、组件模块路径或原始 HTML 塞进 JSON；未来引入新的特殊组件时，同时更新 catalog、registry 和测试。

## Tailwind CSS

使用 v4 CSS-first 配置：`@import "tailwindcss"`、`@theme`、`@source`；PostCSS 使用 `@tailwindcss/postcss`。共享设计 tokens 与必要全局 reset 在 UI 包的 styles.css。组件的布局、颜色、响应式、hover、disabled、aria-invalid 状态全部用 JSX 中的 Tailwind utilities，不定义 .card / .button 等传统组件选择器，也不使用 @apply。Tailwind 静态扫描显式涵盖 workspace 源码；变体采用完整静态类名映射，禁止拼接无法被扫描器识别的 utility 类名。

每个基础组件独立放在 packages/ui/src/components/<kebab-case>.tsx，index.ts 只导出。Button 是原生按钮，LinkButton 是 Next.js 导航链接；Input、Textarea、Select、FormField、Table 提供语义与错误/禁用状态，但不承担业务保存。特殊组件在 packages/render/src/components，registry.tsx 只负责协议到实现的适配，spec-view.tsx 只组合官方 Provider / Renderer。

CapacityPlanner 的宽度是运行时连续数值，唯一动态 style 仅传 --capacity CSS 变量，静态 Tailwind 类 w-[var(--capacity)] 消费它；不生成动态类名，不用 inline style 替代组件样式。useId 保证多实例 label / input 关联不冲突。

## 服务端 API 与 mock

`GET /api/projects` 返回领域 JSON，与展示 Spec 分离。页面直接使用服务器的数据模块，不在服务器内部绕行自己的 HTTP API。替换数据库时，保留 domain schema 与 Spec mapper，替换仓储读取层即可。

## 测试与边界

`pnpm test` 检查全部示例 Spec、稳定 ID、命名 slots、无效引用拒绝和真实 React SSR 文本；另检查一组件一文件、barrel-only 入口、共享 CSS 无组件选择器 / @apply、完整网格变体、表单语义及插槽组件唯一 ID。生产构建后还应检查有效动态路由的 HTML、无效 slug 的 HTTP 404、API 数据与浏览器 hydration。

性能/可访问性：原生语义元素、可见焦点、range label、aria-live、响应式布局、减少动画偏好；无远程字体依赖。

## 一手参考

- https://nextjs.org/docs/app/getting-started/project-structure
- https://nextjs.org/docs/app/api-reference/functions/connection
- https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://pnpm.io/workspaces
- https://github.com/vercel-labs/json-render
- https://json-render.dev/docs

本项目演示明确的架构取舍，不宣称所有团队必须使用完全相同的目录结构。

UI 包是 Next.js 专用基础组件库：导航组件 LinkButton 与 Frame 使用 next/link；LinkButton 是链接而非提交按钮。表单行为使用独立的原生 Button 组件。
