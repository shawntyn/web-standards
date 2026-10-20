# 验证记录

验证日期：2026-10-20。记录实际执行结果，不以源码存在代替运行成功。

## 工具链

Node.js 24.19.0 / pnpm 12.14.0 / Next.js 16.4.2 / React 19.3.1 / Tailwind CSS 4.3.3 / json-render 0.21.1 / TypeScript 6.0.3。版本与 lockfile 未因本次内容重构而升级。

## 内容驱动重构

- 三个独立项目 JSON 文件分别是产品说明、编辑手记和分析报告。共享内容 schema，但实际内容块类型和顺序不同。
- `content.map` 是唯一正文映射边界，文档内容决定顺序；不再固定添加指标卡、源码 JSON 或重复技术说明。
- `Document` 提供阅读宽度与排版。只有 Atlas 的正文需要容量试算，使用 `interactive` 命名 slot。
- data 和 domain 的入口只导出；仓储、内容契约、草稿、页面组合、HTTP mock 服务分开。工作台展示与状态 hook / session store 分开。
- 基础 catalog / registry 不依赖工作台；应用 registry 组合基础定义和工作台，避免正文预览反向导入应用注册表形成循环。
- 文档采用 9 个本地 MDX 文件，删除了不再使用的另一套文档数据和模板。

## 自动化验证

- `pnpm lint`、`pnpm format:check`、`pnpm typecheck`；另单独运行根目录 `tsc --noEmit`，覆盖测试源码类型。
- `pnpm test`：20 项测试。覆盖真实 json-render SSR、三个文档结构差异、增加/删除/重排块无需修改模板、稳定 ID 与 slot 命名空间、未知类型/重复 ID/表格行宽拒绝、基础组件结构与语义、mock API、MDX 适配，以及 happy-dom 中的实际创建/编辑/取消/筛选/失败恢复/会话恢复。
- 正文编辑测试实际进入 Orbit 表单，验证原内容未丢失，拒绝错误 JSON，保存新增和重排后的内容，检查渲染详情与 sessionStorage 一致。
- 双站生产构建及真实 HTTP 验证使用 `pnpm build` 和 `pnpm test:http`。后者启动两个 Next 生产服务，检查完自动退出。结果见 `validation/http-content.json`；命令日志为 `*-content.log`。以这些本轮记录为准，旧日志仅保留作历史。

HTTP 检查包括三个项目的服务端正文、仅 Atlas 出现容量工具、Orbit 引用和代码、Field 数据表、9 篇 MDX、未知路径 404，以及两站 POST / PATCH 合法请求、内容校验 422、标识冲突 409、模拟错误 503。成功响应必须保留正文并声明 `serverStored: false`。

## 明确边界

以上是源码构建、服务端 HTML、真实 HTTP 与 happy-dom 交互验证，不等于真实浏览器视觉或线上登录后的验收。

mock API 不写回源码或数据库。会话状态只保存在当前浏览器标签页；独立 SSR 路由仍展示仓库中的初始 JSON。正文编辑器是带共享校验的 JSON 协议编辑器，不是富文本编辑器。本例覆盖创建、读取和编辑，不包含删除。

预览站保持 owner-private，公开源码不改变预览权限。源码通过验证不代表已完成部署；发布版本由部署流程另行确认。未登录时看到登录页不能作为应用页面验收。
