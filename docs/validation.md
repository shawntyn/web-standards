# 简化版本验证记录

验证日期：2026-10-27，仓库 `/workspace/web-standards`。开始修改时 Git 工作区干净。只修改工作区代码，没有提交、推送、创建 PR 或部署。

## 2026-10-28 提交前复核

按用户明确授权准备直接提交到 main。远端 main 与本地基线同为 `07dabf7`，没有额外提交需要整合。本日使用 pnpm 12.14.0 重新通过 frozen-lockfile 安装、format:check、lint、完整 typecheck、12 项测试、生产构建、32 项 HTTP 检查与 diff 检查；HTTP 明细为本日结果。24 项 Chromium 结果仍为 2026-10-27 的验证记录，本日没有重跑浏览器。未部署；远端提交和 CI 结果以交付时实际核验为准。

## 环境与安装

Node.js 24.19.0。环境默认 pnpm 为 11.25.0，项目指定的 pnpm 12.14.0 安装在 `/tmp/web-standards-tools`，后续验证使用该版本。初次安装因默认用户缓存目录不可写失败，改用 `/tmp` 下的数据、缓存及 store 目录后成功，没有请求额外权限。

移除文档站、编辑器的依赖后，以 pnpm 12.14.0 更新 lockfile，再运行 `pnpm install --frozen-lockfile` 成功。Next.js 16.4.2、React 19.3.1、Tailwind CSS 4.3.3、json-render 0.21.1、TypeScript 6.0.3 均未升级。lockfile 的变更只删除已不用的依赖项。

安装仍提示既有的 ESLint 10 与部分 eslint-config-next 传递插件的 peer 版本范围不匹配；`pnpm peers check` 可复现，实际 lint 成功。本次没有扩大范围升级或降级这些依赖。

## 实际结果

| 命令 / 检查                        | 结果                                          |
| ---------------------------------- | --------------------------------------------- |
| `pnpm install --frozen-lockfile`   | 通过，pnpm 12.14.0，临时可写 store            |
| `pnpm format:check`                | 通过                                          |
| `pnpm lint`                        | 通过                                          |
| `pnpm typecheck`                   | 通过，包含所有 workspace 及根目录测试类型检查 |
| `pnpm test`                        | 12 项通过，0 失败                             |
| `pnpm build`                       | 单个 Next.js 应用生产构建通过                 |
| `pnpm test:http`                   | 32 项生产 HTTP 检查通过                       |
| Chromium + Playwright 本地生产服务 | 24 项浏览器检查通过                           |
| `git diff --check`                 | 通过                                          |

首次完整类型检查发现测试数组的类型推断问题；首次构建发现 404 Spec 的两个叶节点缺少必需的 children 数组。两项均已修正，并重新通过类型检查、测试和构建，没有跳过任何检查。

生产构建只有 `/`、`/projects/[slug]`、`/analytics/[slug]` 三个页面路由和框架 `/_not-found`；三个页面均在请求时 SSR。`scripts/verify-production.mjs` 同时检查构建 manifest，避免残留页面入口。

## 覆盖内容与证据

- `tests/spec.test.ts`：真实官方 Renderer 输出、项目结构差异、一节点一元素、ID/props/children/slots 保真、JSON 增删重排、不补标题或 slot、元数据与正文分离、非法内容及 Spec 拒绝。
- `tests/analytics.test.ts`：查询字段到表格单元格、顺序、零值、空态、不修改源数据、非法查询数据和未知参数。
- `tests/ui-architecture.test.ts`：独立组件文件、barrel 入口、共享 CSS 边界和静态 Tailwind 网格变体。
- [HTTP 明细](validation/http-simplified.json)：五个有效 URL 的 SSR 内容和全部站内导航目标、百分号编码参数、未知/大小写错误/原型属性/多段参数、缺少参数、移除页面，以及 GET/POST/PATCH 旧 API 的真实 404。
- [浏览器明细](validation/browser-simplified.json)：Chromium 154.0.8037.57，桌面 1280×900、手机 390×844。五个有效 URL 直接访问和刷新、真实 Next 客户端点击跳转、浏览器返回、零值/空态、键盘焦点、五页无水平溢出、七个无效 URL 直接访问和刷新。客户端跳转检查了 window 标记保留，确认没有整页重载。有效页面控制台错误和 pageerror 均为空。

浏览器验证通过 `/tmp` 安装 Playwright，使用系统 `/usr/bin/chromium` 与临时检查脚本 `/tmp/web-standards-browser-check.cjs`；没有添加应用框架或浏览器测试依赖到项目。已查看本地桌面首页与手机空态截图，确认内容和导航可读。

## 未验证项

没有部署或更新既有线上预览，因此未做线上登录后的验收。没有运行 Firefox、Safari、屏幕阅读器或覆盖所有设备尺寸。旧的 `validation/*-declarative.*`、`*-content.*`、`analytics.md` 等仅为历史记录，不代表当前版本。
