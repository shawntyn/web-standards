# 中文阅读指南

先跟读 `/projects/atlas`，再看 `/analytics/commerce`。不必从所有包的 `index.ts` 开始；这些入口文件只负责导出。

## 1. URL 如何选到数据

打开 `apps/web/src/app/projects/[slug]/page.tsx`。Next.js 把 `/projects/atlas` 中的 `atlas` 放进 `params`，页面用 `await params` 取出它，再调用 `getProject(slug)`。

`packages/data/src/project-repository.ts` 明确导入 `projects/atlas.json` 和 `projects/orbit.json`。`ProjectListSchema.parse()` 校验数据，`.find()` 按 slug 选择记录。没有找到就由路由调用 `notFound()`，返回 404；URL 不参与拼接文件路径。

每个项目只有 `slug`、`name`、`description`、`content` 四个字段。前三个字段供路由、SEO 和首页摘要使用，详情正文完全由 `content` 决定。Atlas 用卡片与列表，Orbit 用表格，结构来自各自的 JSON 文件。

## 2. JSON 如何变成 Spec

打开 `packages/data/src/projects/atlas.json`，其中一个节点是：

```json
{ "id": "atlas-title", "type": "h1", "props": { "text": "Atlas 项目" } }
```

`packages/domain/src/content.ts` 规定允许哪些节点、props、children 和 Card slots；未知字段、重复 ID 等会报错。

接着读 `packages/render/src/content-to-spec.ts` 的 `contentToSpec()`。它递归遍历节点，用 `.map()` 将嵌套 children 和 slots 换成 ID 数组，一个源节点对应一个元素。上面的节点变为：

```json
{
  "type": "Heading",
  "props": { "text": "Atlas 项目", "level": 1 },
  "children": []
}
```

它存在 `spec.elements["atlas-title"]` 中。根 ID 存在 `spec.root` 中。`h1…h6` 转为 `Heading(level)`，`p` 转为 `Text`，其他组件名称保持不变。转换器不会补标题、布局或按钮。

## 3. Spec 如何变成页面

路由调用 `packages/data/src/page-shell.ts` 的 `pageSpec()`，在正文外增加共同的 Frame 导航。它与纯正文转换器分开；`packages/data/src/validate-spec.ts` 再用 catalog 检查 props、slots、引用和循环。

之后 `<SpecView spec={...} />` 在 `packages/render/src/spec-view.tsx` 使用官方 `JSONUIProvider` 与 `Renderer`。`catalog.ts` 定义组件契约，`registry.tsx` 将协议名称对应到 React 组件，例如 `Heading → UI.Heading`。最终 `packages/ui/src/components/heading.tsx` 输出真正的 `<h1>`，样式来自 Tailwind。

页面使用 `await connection()` 在请求时读取数据。`SpecView` 虽然是 Client Component，Next.js 首次访问仍在服务器输出包含实际内容的 HTML，然后浏览器接管导航。首屏不需要客户端 fetch。

## 4. 统计页多了哪一步

阅读顺序：

```text
apps/web/src/app/analytics/[slug]/page.tsx
  → packages/data/src/analytics/repository.ts：按 slug 选择本地 JSON
  → packages/data/src/analytics/fixtures/commerce.json：三条 channels 记录
  → packages/data/src/analytics/query-schema.ts：校验字段与非负整数
  → packages/data/src/analytics/mapping.ts：analyticsToSpec()
  → pageSpec() → SpecView → registry → ContentTable
```

这里的原始记录是业务字段，不是 UI 节点：

```json
{ "channel_name": "自然搜索", "order_count": 8 }
```

`analytics/display.json` 声明标题、布局、列名和一个 ID 为 `channels-table` 的空表格。`analyticsToSpec()` 先把展示树转成 Spec，再只做一次明确的字段转换：

```ts
table.props.rows = data.channels.map((row) => [
  row.channel_name,
  String(row.order_count),
]);
```

所以记录变成 `["自然搜索", "8"]`，传给 `packages/ui/src/components/content-table.tsx`。这不是数据库连接，也没有通用绑定引擎。`/analytics/empty` 使用相同展示树和另一份空集合，显示“暂无数据”；订单数 `0` 正常显示。

## 5. 首页与动手练习

首页路径是 `apps/web/src/app/page.tsx → packages/data/src/pages/home.ts → pageSpec → SpecView`。`mapping/project-cards.ts` 用 `.map()` 将项目名称、简介和 slug 转成摘要卡片与详情链接。

可以在本地尝试：

1. 改 `projects/atlas.json` 的 `atlas-title.props.text`，刷新 `/projects/atlas`，标题随之改变。
2. 删除 Atlas 的 h1 节点或 Card 的 footer，页面不会自动补回来；调整 children 顺序，页面顺序也会改变。
3. 只改项目 `name`，首页卡片与网页标题改变，详情正文保持由 content 决定。
4. 改 `analytics/fixtures/commerce.json` 的 `order_count`，刷新统计页，单元格更新；负数会被校验拒绝。
5. 访问 `/projects/missing`、`/analytics/missing`，得到 404。从页内链接切换两个项目和两份统计数据，无需添加新路由文件。

这些数据来自源码文件，没有编辑界面、写入 API 或浏览器会话状态。协议保真、顺序变化、零值和空态的自动化检查位于 `tests/spec.test.ts` 与 `tests/analytics.test.ts`。
