# 验证记录

验证日期：2026-10-20。此记录来自实际执行，不以源码存在代替运行成功。

## 工具链

- Node.js 24.19.0
- pnpm 12.14.0（实际执行官方二进制）
- Next.js 16.4.2 / React 19.3.1 / Tailwind CSS 4.3.3
- json-render core/react 0.21.1
- TypeScript 6.0.3；typescript-eslint 当前不支持 TS 7，未关闭类型检查规避问题。

## 已通过

- `pnpm lint`：退出 0，零警告、零错误。
- `pnpm typecheck`：UI、render、data、web、docs 全部通过；Next 路由类型生成成功。
- `pnpm test`：5/5 通过，含真实 json-render SSR 和命名 slot 内容断言。
- `pnpm format:check`：全部文件格式通过。
- 两站分别 `pnpm --filter @repo/web build`、`pnpm --filter @repo/docs build`：退出 0。
- 构建输出标记首页、动态 slug、规范页和 API 为 `ƒ`（请求时服务端渲染），不是静态导出。
- 两个生产服务在同一个执行环境中启动后进行真实 HTTP 验证：7 个页面检查全部通过，另有 API JSON 检查通过。

| 应用 | 路径                | HTTP | 检查                                      |
| ---- | ------------------- | ---- | ----------------------------------------- |
| web  | /                   | 200  | 初始 HTML 包含首页正文                    |
| web  | /projects/atlas     | 200  | 初始 HTML 包含 Atlas                      |
| web  | /projects/missing   | 404  | 不存在的动态资源正确返回 404              |
| web  | /standards          | 200  | 初始 HTML 包含规范正文                    |
| docs | /                   | 200  | 初始 HTML 包含组件文档                    |
| docs | /components/slot    | 200  | 初始 HTML 包含特殊组件 range input        |
| docs | /components/missing | 404  | 不存在的组件正确返回 404                  |
| web  | /api/projects       | 200  | 返回 3 条静态 mock 领域对象，而非 UI Spec |

原始日志位于 `docs/validation/`。

## 预览部署与验证边界

主站与组件文档已分别部署为保留 Next.js SSR 的 owner-private 预览，地址见 README。仓库公开不改变预览站的访问权限，需要项目所有者登录 ChatGPT。

上述构建、SSR HTML、HTTP 状态与测试记录来自源码运行验证，不代表浏览器端视觉、hydration 与所有交互已完成验收。部署端的未登录请求会进入登录流程，不能将登录页响应当成应用页面验证结果。

没有将 localhost 作为可交付预览，也没有为取得链接改为静态导出。部署身份、凭证和本地构建产物不包含在公开源码中。
