# Web Standard：从 JSON 到页面

一个便于跟读源码的小例子，保留 pnpm workspace、Next.js App Router、Tailwind CSS 和官方 json-render，只使用两个本地项目 JSON。

现在共有三个实际页面：

| URL               | 内容                       | 路由文件                                    |
| ----------------- | -------------------------- | ------------------------------------------- |
| `/`               | Atlas / Orbit 两个项目入口 | `apps/web/src/app/page.tsx`                 |
| `/projects/atlas` | 卡片和任务列表             | `apps/web/src/app/projects/[slug]/page.tsx` |
| `/projects/orbit` | 简短阅读计划表格           | 同一个 `projects/[slug]/page.tsx`           |

两个项目共用一个动态路由，按 slug 选择不同 JSON。未知 slug 返回真实 404。analytics 已移除，旧统计地址也返回 404；没有编辑工作台、写入 API 或浏览器会话存储。

## 运行

需要 Node.js 24+、pnpm 12.14.0（版本以 package.json 和 lockfile 为准）。

```sh
pnpm install --frozen-lockfile
pnpm dev
# http://localhost:3000
```

不需要数据库、环境变量或第二个服务。

## 跟读一条链路

```text
/projects/atlas
  → getProject(slug)：选择 projects/atlas.json
  → contentToSpec(project.content)：嵌套 JSON 展平为 Spec
  → pageSpec(content)：增加共同导航并校验
  → SpecView / 官方 Renderer：通过 registry 找到 UI 组件
  → HTML
```

[中文阅读指南](docs/reading-guide.md) 列出了这条链路的实际文件和一个真实转换例子。`domain` 定义数据规则，`data` 提供项目和页面组合，`render` 对接 json-render，`ui` 实现普通 React 组件。

## 验证

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:http
```

`test:http` 在构建后临时启动并关闭 3200 端口的生产服务，验证三个实际页面、导航、SSR、无效 slug 和移除入口的 404。实际结果见 [验证记录](docs/validation.md)，开发约定见 [AGENTS.md](AGENTS.md)。线上预览尚未部署本次修改。
