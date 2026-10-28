# 中文阅读指南

先跟读 `/projects/atlas`，再用同一条链路看 `/projects/orbit`。项目只包含首页和这两个详情，共三个实际页面；两个详情共用一个动态路由。

## 一条数据链路

| 顺序 | 实际文件                                              | 做什么                                                                   |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | `packages/data/src/projects/atlas.json`、`orbit.json` | 源数据：slug、name、description，以及明确声明页面结构的 content。        |
| 2    | `apps/web/src/app/projects/[slug]/page.tsx`           | `await params` 取 slug，调用 `getProject()`；不存在就 `notFound()`。     |
| 3    | `packages/data/src/project-repository.ts`             | 静态导入两个 JSON，用 `ProjectListSchema` 校验，再按 slug 查找。         |
| 4    | `packages/render/src/content-to-spec.ts`              | `contentToSpec(project.content)` 将嵌套节点展平成 `{ root, elements }`。 |
| 5    | `packages/data/src/page-shell.ts`                     | `pageSpec()` 添加共同 Frame 导航，再调用 `validateSpec()`。              |
| 6    | `packages/render/src/spec-view.tsx`                   | `SpecView` 将 Spec 交给官方 `JSONUIProvider` 和 `Renderer`。             |
| 7    | `packages/render/src/registry.tsx`                    | 将名称对应到 React 组件，例如 `Heading → UI.Heading`。                   |
| 8    | `packages/ui/src/components/heading.tsx` 等           | 接收普通 props，输出带 Tailwind 样式的 HTML。                            |

项目 JSON 在模块中静态导入；请求时选择对应项目并转换内容。整个 JSON → Spec 的过程发生在服务器。`SpecView` 虽标记 `use client`，Next.js 首屏仍输出包含内容的 HTML，再由浏览器 hydration 和处理链接导航。

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

每个源节点只产生一个元素；h1…h6 转成 Heading(level)，p 转成 Text，其余组件名称不变。正文转换器不补标题、容器或按钮。之后 `pageSpec()` 独立增加 `site-frame` 根节点，使它的 children 指向原正文根节点。

## 规则和展示的分工

- `packages/domain/src/project-schema.ts` 校验项目的四个字段，`content.ts` 校验源节点、props、children、Card slots 和 ID 唯一性。
- `packages/render/src/catalog.ts` 规定目标 Spec 可以使用的组件和参数；`packages/data/src/validate-spec.ts` 再检查 props、slots、引用、循环等。
- Spec 是页面结构数据，registry 提供组件实现，Renderer 负责按结构创建组件树。

Atlas 的正文是卡片与列表，Orbit 是表格；不同结构来自各自的 JSON，不是路由里写死的两个页面。项目 name / description 用于首页摘要，name 还用于网页标题；详情正文只由 content 决定。

## 首页和动手练习

首页走 `apps/web/src/app/page.tsx → packages/data/src/pages/home.ts` 的 `homeSpec()`，再进入共同的 `pageSpec → SpecView / Renderer`。`mapping/project-cards.ts` 仅将两个项目的元数据转换为卡片和详情链接，不需要另一套数据来源。

可以尝试改 Atlas 的标题、调整 children 顺序，或删除 h1 / footer：页面会跟随源数据变化，不会自动补回。只改 name 会改变首页卡片与网页标题，不会改正文。访问 `/projects/missing` 会得到 404。

`index.ts` 都只是导出入口；无需先读。相关行为测试在 `tests/spec.test.ts`，生产路由检查在 `scripts/verify-production.mjs`。
