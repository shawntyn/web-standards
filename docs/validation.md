# 验证记录

验证日期：2026-10-20。此记录来自实际执行，不以源码存在代替运行成功。

## 工具链

- Node.js 24.19.0 / pnpm 12.14.0（官方二进制）。
- Next.js 16.4.2 / React 19.3.1 / Tailwind CSS 4.3.3。
- json-render core/react 0.21.1。
- TypeScript 6.0.3；typescript-eslint 当前不支持 TS 7，未关闭类型检查规避问题。

## 本次修正后的验证

- `pnpm format:check`、`pnpm lint`、`pnpm typecheck` 通过。
- `pnpm test`：15/15 通过。包含真实 json-render SSR、命名 slot、独立组件结构、表格和表单语义、mock API 验证、MDX spec 适配回归，以及 happy-dom 中的创建、编辑、取消、筛选、校验、保存失败恢复、列表与会话详情同步、重新挂载恢复。
- 两站生产构建通过。最后重新构建 docs，确认 MDX 叶节点补全空 children 的修复进入构建；适配后仍严格执行 catalog 与引用验证。
- 两个生产服务在同一次执行环境中启动，真实 HTTP 回归 26 项全部通过。原始结果见 `validation/http-refactor.json`，含核实时间。

| 应用       | 路径                                                                                      | HTTP 与检查                                                    |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| web        | `/`、`/projects`、`/projects/atlas`、`/standards`                                         | 200，初始 HTML 包含对应正文                                    |
| docs       | `/`                                                                                       | 200，初始 HTML 包含组件文档                                    |
| docs       | `/components/primitives`、`card`、`button`、`metric`、`slot`、`table`、`form`、`workflow` | 8 篇本地 MDX 全部 200，包含 JSON 示例内容，无服务端错误 digest |
| web / docs | `/projects/missing` / `/components/missing`                                               | 404                                                            |
| 两站       | `POST /api/projects`                                                                      | 合法输入 201；无效字段 422；模拟失败 503                       |
| 两站       | `PATCH /api/projects/atlas`                                                               | 200；标识不一致 409                                            |
| web        | `GET /api/projects`                                                                       | 200，仍返回 3 条原始静态领域对象，写操作不篡改 JSON            |

HTTP 写入成功响应均验证 `serverStored: false`。mock API 是服务端校验和响应模拟，并非持久化数据库；用户更改保存在当前浏览器标签页 sessionStorage，不能将它描述为跨用户或跨标签页共享持久化。本例覆盖创建、读取、编辑，不包含删除功能。

## 独立源码复核

- `packages/ui/src/components/` 有 19 个独立基础组件文件，入口 `index.ts` 仅导出；旧 `index.tsx` 已移除。
- 组件使用 Tailwind utility 和静态 variant；共享 `styles.css` 仅保留 `@theme` 与全局 base，不含传统组件类定义或 `@apply`。
- 两站分别使用 Tailwind v4 入口与显式 `@source` 扫描共享 UI、render 包。
- 特殊容量组件的动态数值仅通过 CSS 自定义属性传入 utility，不是另一套组件 CSS。
- `apps/web` 与 `apps/docs` 独立 Next 应用；共享 domain、data、ui、render 包职责分开。
- 业务领域数据、表格行与表单字段通过映射构建 Spec，交由 catalog/registry 和真实 json-render Renderer 渲染。
- 文档使用 8 个本地 MDX 文件和明确模块白名单，动态路由 await params，未知文档返回 404，不编译不可信远程 MDX。

## 预览部署与验证边界

以上为源码生产构建、服务端 HTML、真实 HTTP 和 happy-dom 交互测试，不代表真实浏览器视觉、hydration 与全部交互已验收。没有完成真实浏览器视觉验证，不将 DOM 模拟测试写成浏览器验收。

README 中的预览地址为 owner-private，需要项目所有者登录 ChatGPT；公开仓库不改变预览权限。此次源码验证不证明新修正已经部署；部署版本应另行核实。未登录登录页不算应用页面验收。

没有将 localhost 作为交付链接，也没有改为静态导出。凭证和本地构建产物不包含在公开源码中。`validation/` 保留原始及本次日志；本次 HTTP 结果以 `http-refactor.json` 为准。
