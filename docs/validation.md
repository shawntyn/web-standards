# 首页与两个项目的验证记录

最新结果：[2026-10-29 JSON 转换、目录收拢与自动读取验证](validation/json-conversion.md)。以下保留 2026-10-28 页面范围简化时的记录；浏览器历史结果不能代替本次验证。`http-simplified.json` 已由本次检查更新。

验证日期：2026-10-28。开始时工作区干净，本地 HEAD 与远端 main 均为 `40932eafd9554ae57d69e75987f675346c57b7d2`；没有他人新提交需要整合。以下记录本次实现提交前的本地验证结果；源码提交及远端 CI 状态以 GitHub 对应提交为准。本次不部署、不创建 PR。

## 当前范围

三个实际页面是 `/`、`/projects/atlas`、`/projects/orbit`。构建中只有 `/` 与 `/projects/[slug]` 两个页面路由，以及框架 404 边界；两个项目仍共享一个动态路由。

analytics 路由、整个数据目录、专属查询 schema / repository / mapping、导出、首页入口和导航链接已删除；删除对应测试与旧说明。`@repo/data` 不再直接依赖 zod，domain 和 render 所需的 zod 保留。两个项目 JSON、正文 schema、contentToSpec、catalog、registry 和动态项目路由均保持原实现。

## 实际验证结果

环境：Node.js 24.19.0、pnpm 12.14.0。未升级 Next.js、React、Tailwind CSS 或 json-render；lockfile 仅移除 data 包不再使用的直接依赖。

| 检查                             | 结果                                    |
| -------------------------------- | --------------------------------------- |
| `pnpm install --frozen-lockfile` | 通过，使用临时可写 store                |
| `pnpm format:check`              | 通过                                    |
| `pnpm lint`                      | 通过                                    |
| `pnpm typecheck`                 | 所有 workspace 与根目录测试类型检查通过 |
| `pnpm test`                      | 9 项通过，0 失败                        |
| `pnpm build`                     | 单应用生产构建通过，无 analytics 路由   |
| `pnpm test:http`                 | 26 项真实生产 HTTP 检查通过             |
| Chromium + Playwright            | 25 项真实浏览器检查通过                 |
| `git diff --check`               | 通过                                    |

安装仍存在原有 ESLint 10 与部分传递插件 peer 范围提示，实际 lint 通过；没有为此修改依赖版本。

## 证据与覆盖

- `tests/spec.test.ts` 验证三个有效导航目标、真实官方 Renderer 的 SSR、两个项目结构差异、一节点一元素、props / children / slots 保真、增删重排、不补标题或 slot、未知 slug 和非法内容拒绝。`tests/ui-architecture.test.ts` 保留 UI 文件和 Tailwind 边界检查。
- [HTTP 明细](validation/http-simplified.json)：三个实际页面和全部站内导航目标、百分号编码的有效项目参数、缺少参数和无效 slug 的 404。检查 `/analytics`、commerce / empty / zero / missing 及编码旧地址全部返回 404；旧编辑 API 的 GET / POST / PATCH 也仍返回 404。脚本检查构建 manifest，确保仅有首页与共享动态项目路由。
- [浏览器明细](validation/browser-simplified.json)：Chromium 154.0.8037.57，桌面 1280×900、手机 390×844。覆盖三页直接访问与刷新、实际 Next 客户端导航、浏览器返回、三页全部导航目标、键盘可见焦点、三页无水平溢出，以及 12 个无效或移除 URL 的直接访问和刷新 404。客户端跳转保留 window 标记，确认没有整页重载；有效页控制台错误与 pageerror 均为空。

浏览器验证使用 `/tmp` 下的 Playwright 和检查脚本 `/tmp/web-standards-projects-browser-check.cjs`、系统 Chromium，没有向项目增加依赖。已查看桌面首页和手机 Orbit 页面截图，导航及内容可读。

## 验证边界

线上预览尚未部署本次修改。以下本地结果不代表远端 CI 通过；未运行 Firefox、Safari、屏幕阅读器或覆盖所有设备尺寸。其余旧日志与 HTTP 文件是历史记录，不作为当前结果。
