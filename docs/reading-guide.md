# 中文阅读指南

先跟读 `/projects/atlas`，再用同一条链路看 `/projects/orbit`。这两个 JSON 是附带样例；首页入口和项目详情由数据目录决定，所有详情共用一个动态路由。

## 一条数据链路

| 顺序 | 实际文件                                    | 做什么                                                                                       |
| ---- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | `packages/data/src/projects/*.json`         | 源数据：slug、name、description，以及明确声明页面结构的 content。                            |
| 2    | `apps/web/src/app/projects/[slug]/page.tsx` | `await params` 取 slug，读取列表后调用 `getProject(slug, projects)`；不存在就 `notFound()`。 |
| 3    | `packages/data/src/project-repository.ts`   | `getProjects()` 读取目录并用 `ProjectListSchema` 校验；`getProject()` 只在列表中查找。       |
| 4    | `packages/render/src/content-to-spec.ts`    | `contentToSpec(project.content)` 将嵌套节点展平成 `{ root, elements }`。                     |
| 5    | `packages/data/src/validate-spec.ts`        | `validateSpec(contentSpec)` 检查最终正文 Spec 的组件属性、slots 和引用。                     |
| 6    | `packages/render/src/spec-view.tsx`         | `SpecView` 将 Spec 交给官方 `JSONUIProvider` 和 `Renderer`。                                 |
| 7    | `packages/render/src/registry.tsx`          | 将名称对应到 React 组件，例如 `Heading → UI.Heading`。                                       |
| 8    | `packages/ui/src/components/heading.tsx` 等 | 接收普通 props，输出带 Tailwind 样式的 HTML。                                                |

`getProjects()` 每次调用都重新读取固定目录，只取直接子级的普通 `.json` 文件，按文件名字典顺序排列，不递归、不跟随符号链接，也不保留模块级项目列表缓存。URL 的 slug 只用于查找已读取的列表，不用于拼接文件路径。JSON 解析、项目 schema 或 slug 唯一性校验失败会明确抛错。

请求时读取项目并转换内容，整个 JSON → Spec 的过程发生在服务器。`SpecView` 虽标记 `use client`，Next.js 首屏仍输出包含内容的 HTML，再由浏览器 hydration 和处理链接导航。

每份读出的项目列表在 `project-repository.ts` 入口校验一次。`contentToSpec()` 接收已校验的 `ContentNode`，只负责转换；单独处理其他原始 JSON 时，也应先调用 `ContentSchema.parse(raw)`，再把结果交给转换器。页面、根 layout 和网页标题生成分别调用同一个读取函数，不另维护导航数据。

Next 脚本从 `apps/web` 启动，默认目录据此解析为 `packages/data/src/projects`；测试显式传入源目录或临时目录。部署必须包含这个数据目录并保留相对目录关系，Next 配置中的文件追踪覆盖其 JSON。刷新能发现运行环境里的文件变化；不可变部署新增 JSON 仍须正常构建发布，本地源码不会自动同步线上。

## 看一次真实转换

Atlas 中的一个节点：

```json
{ "id": "atlas-title", "type": "h1", "props": { "text": "Atlas 项目" } }
```

`contentToSpec()` 把它存成：

```json
{
  "type": "Heading",
  "props": { "text": "Atlas 项目", "level": 1 },
  "children": []
}
```

这个对象位于 `spec.elements["atlas-title"]`。完整正文的 `spec.root` 是 `"atlas"`，根节点的 children 从嵌套对象变为 `["atlas-title", "atlas-intro", "atlas-plan"]`。Card 的 footer 同样变为 ID 引用：`["atlas-next"]`。

每个源节点只产生一个元素；h1…h6 转成 Heading(level)，p 转成 Text，其余组件名称不变。正文转换器不补标题、容器或按钮。最终 Spec 的 root 仍为正文根 ID，不增加外框元素，也没有 `shell` 保留 ID。

## 公共外框在哪里

`apps/web/src/app/layout.tsx` 读取项目列表生成导航，直接使用 `packages/ui/src/components/app-shell.tsx` 的 `AppShell` 包住 `children`。它负责公共导航、正文区域和页脚，首页、详情和 404 共用；正文才进入 json-render，AppShell 不需要 catalog / registry 注册。

完整刷新页面时会重新读取运行环境中的 JSON。站内链接跳转会复用共享 layout，因此不能把它理解为每次点击都会重新读导航。`getProjects()` 本身仍然没有缓存。

## 规则和展示的分工

- 组件名称在 JSON、schema、catalog、registry 和 UI 中保持一致：`Button`、`List`、`Table`。`Button` 当前用于导航，接收 `label` / `href`，内部使用 Next Link；`List` 根据 `ordered` 输出 ul / ol；`Table` 输出带 caption 和列标题的原生表格。这些名称是项目约定，json-render 不规定必须使用哪些组件名。
- `Card.titleLevel` 控制卡片标题的语义级别，默认 h3；Atlas 明确指定 h2，首页卡片沿用 h3。标题级别不会改变卡片字号。`Grid.columns` 在 JSON 校验与 UI 类型中均只接受 1–4。
- `packages/domain/src/component-props-schema.ts` 用 `componentPropsSchemas` 集中定义组件属性校验规则，源内容 schema 与 catalog 共用；新增属性时还需同步 UI 类型与实现。
- `packages/domain/src/project-schema.ts` 校验项目的四个字段，`content-schema.ts` 复用属性规则并校验源节点、children、Card slots 和 ID 唯一性。h1…h6 的级别由名称表达，因此源 props 不接受 level。
- `packages/render/src/catalog.ts` 声明目标组件及可用 slots；`packages/data/src/validate-spec.ts` 校验最终 Spec 的 props、slots、引用和循环。`catalog.validate()` 的结构检查不能替代逐组件的严格属性检查。
- catalog 中的 `default` 表示组件可接收 `children`，最终 Spec 不允许写 `slots.default`；命名 slots 只用于 header、footer 等明确区域，避免 Renderer 忽略内容。
- Spec 是页面结构数据，registry 提供组件实现，Renderer 负责按结构创建组件树。

`root`、`elements`、`children` 和 `slots` 是当前官方 React 渲染格式中的字段：root 指向根元素 ID，elements 按 ID 保存元素，children 和 slots 通过 ID 引用子元素。首页和 404 正文直接写这些对象，无需另学 `node()` 构造函数。源 JSON 的嵌套 content 是本项目的输入格式，由转换器适配。

Atlas 的正文是卡片与列表，Orbit 是表格；不同结构来自各自的 JSON，不是路由里写死的两个页面。项目 name / description 用于首页摘要，name 还用于网页标题和导航文字，slug 决定项目链接；详情正文只由 content 决定。

## 首页和动手练习

首页先调用 `getProjects()`，由 `homeSpec(projects)` 生成正文，再经 `validateSpec()` 进入 `SpecView / Renderer`。`apps/web/src/app/page.tsx` 是入口，`packages/data/src/home-spec.ts` 负责首页结构及项目卡片、详情链接；不需要另一套数据来源，也不为首页专用映射另建单文件中间目录。

可以添加一份使用新 slug 的项目 JSON，然后完整刷新：新项目会出现在首页和导航中，并通过同一个动态路由显示详情。删除文件后完整刷新，对应详情返回 404。也可以改 Atlas 的标题、调整 children 顺序，或删除 h1 / footer：页面会跟随源数据变化，不会自动补回。只改 name 会改变首页卡片、导航文字与网页标题，不会改正文。访问项目列表中不存在的 slug 会得到 404。

`index.ts` 都只是导出入口；无需先读。相关行为测试在 `tests/spec.test.ts`，生产路由检查在 `scripts/verify-production.mjs`。
