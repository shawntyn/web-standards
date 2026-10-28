# Web Standard：从数据到页面

一个适合顺着源码阅读的小例子。保留 pnpm workspace、Next.js App Router、Tailwind CSS 与官方 json-render，使用只读本地 JSON。

只有三个页面路由（404 是错误边界）：

| 路由文件                                     | 可访问示例                                | 展示内容                     |
| -------------------------------------------- | ----------------------------------------- | ---------------------------- |
| `apps/web/src/app/page.tsx`                  | `/`                                       | 两个项目入口和统计入口       |
| `apps/web/src/app/projects/[slug]/page.tsx`  | `/projects/atlas`、`/projects/orbit`      | 按 slug 读取不同 JSON 内容树 |
| `apps/web/src/app/analytics/[slug]/page.tsx` | `/analytics/commerce`、`/analytics/empty` | 按 slug 读取订单记录或空集合 |

这里的“三个页面”指三个路由文件。两个动态路由各有多个参数实例；`missing`、大小写错误等未知参数返回真实 HTTP 404。

## 运行

要求 Node.js 24+，pnpm 12.14.0（根 `package.json` 指定版本）。

```sh
pnpm install --frozen-lockfile
pnpm dev
# 打开 http://localhost:3000
```

不需要数据库、环境变量或第二个服务。已移除模拟编辑工作台、会话存储、mock 写入 API、架构规范页和独立组件文档站。原有线上预览未随本次源码修改更新。

## 按这个顺序读

先看 [中文阅读指南](docs/reading-guide.md)，它用实际文件解释两条数据链路。最短的一条是：

```text
/projects/atlas
  → apps/web/src/app/projects/[slug]/page.tsx：await params，取出 slug
  → packages/data/src/project-repository.ts：选择 atlas.json 并校验
  → packages/render/src/content-to-spec.ts：嵌套节点变为 root / elements
  → packages/data/src/page-shell.ts：添加共同导航并校验 Spec
  → packages/render/src/spec-view.tsx：官方 Renderer
  → packages/render/src/registry.tsx：Heading 对应 UI.Heading
  → packages/ui/src/components/heading.tsx：输出真正的 <h1>
```

四个包各负责一件事：`domain` 定义数据形状，`data` 读取和组合数据，`render` 对接 json-render，`ui` 实现普通 React 组件。跨包通过 workspace exports 引用；没有添加新框架。

## 验证

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:http
```

`test:http` 会启动并关闭本地 3200 端口的生产服务，检查三个路由、首屏 HTML、导航目标、无效参数和已移除入口。检查前需完成构建，且端口没有其他服务占用。实际结果见 [验证记录](docs/validation.md)。工程修改约定见 [AGENTS.md](AGENTS.md)。
