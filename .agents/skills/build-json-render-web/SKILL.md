---
name: build-json-render-web
description: 构建或重构采用 pnpm monorepo、Next.js、Tailwind CSS 与 json-render 的规范示例项目，或审查其目录边界、声明式数据映射、组件库、MDX 文档及 mock 编辑流程。适用于这套技术栈的实现和规范审查，不把普通 Markdown 排版或其他技术栈改造成该架构。
---

# 构建声明式全栈 Web 示例

## 适用范围

这是一套明确选择的工程约束，不是所有项目的唯一“最佳规范”。先读取目标项目的 AGENTS、依赖、目录和现有测试，再执行当前请求。已有项目保留有效约定；冲突时依据用户最新要求处理，不暗中迁移技术栈、增加业务范围或发布权限。

本 Skill 的重点是：**JSON 表达组件结构，map 转换协议，组件负责表现与行为。** “像 Markdown 一样清晰”指数据语义可读，不是强制文章视觉样式，更不是用 MDX 替代 json-render。

## 实施顺序

1. 明确应用边界、数据协议、编辑流程和验收证据。新建/明确升级时核对官方当前稳定版与兼容矩阵；已有修复遵循 lockfile，不顺便升级。
2. 按应用和职责放置文件：可独立部署的主站/文档用 `apps/<app>`，共享基础 UI 用 `packages/ui`，渲染接入与领域/数据层分离。Route Group 仅解决一个应用内部布局。不要把一套固定目录当成官方强制标准。
3. 先写有实际结构差异的独立 JSON 样例和严格 schema，再实现纯协议映射。阅读 [声明式映射正反例](references/declarative-contract.md) 后再改 mapper。
4. 编写独立 Tailwind 组件、catalog、registry 和命名 slots，再接入 Next SSR 动态路由与 mock 编辑流程。
5. 文档使用 MDX；交互组件演示仍经过同一 json-render 路径。执行 [行为验收清单](references/acceptance.md)，按实际覆盖范围报告结果。
6. 将本项目已确定的目录、命令、边界写入根 AGENTS.md。可从 [AGENTS 模板](assets/AGENTS.template.md) 改写，核实后填写；不要原样复制示例路径、命令或项目特例。

## 必须守住的约束

### 结构与复用

- pnpm workspaces 与显式包 exports；版本/包管理器可复现，提交 lockfile。
- 自写基础 UI，不引入外部 UI 组件库。业务扩展放在受信任组件层，不侵入通用 UI。
- 一个独立组件一个文件，barrel 只导出；读取、schema、mapper、状态/存储、HTTP 和视图按职责拆开。不要 all-in，也不要无意义碎片化。
- 独立示例分别存文件，组件树应有真正差异。共享的是 renderer / schema / mapper，不是强制所有页面相同模板，不复制多套转换代码。

### 数据与渲染

- 保留可检查的“静态 mock JSON → 显式 map → json-render Spec → catalog/registry → 官方 Renderer”步骤，不能用手写页面 JSX 代替。
- 源数据明确声明内容、语义类型、顺序、布局和 slots。h1 就是 h1；允许一对一语义别名，但不得添加数据中没有的标题、说明、指标、导航、容器或工具。
- 对声明式节点树，每个源节点对应一个目标 Spec 元素；children/slots 顺序与 props 含义保留。不要将“每节点”误解成“每个 DOM 元素”：组件可有内部语义结构、默认 Tailwind 样式和必要交互文案。
- 应用级 shell/SEO 与正文协议分层。展示元数据必须有明确的数据契约，不能因字段存在就自动注入正文。
- schema 与 catalog 校验类型、props、slots、唯一 ID 和引用；预注册特殊组件，通过命名 slot 扩展。JSON 不执行函数/JSX、不任意导入组件或注入 HTML。

### UI、Next 与文档

- 组件用完整静态 Tailwind utilities 和变体映射；共享 CSS 仅 tokens、必要 base/reset、框架导入。不要恢复传统组件 class 规则或 `@apply`；运行时连续值可用 CSS 变量，不以此替代组件样式。
- 使用对应 Next 版本推荐的 App Router、Server/Client 边界和动态参数处理；本类示例要求请求时 SSR，未知资源真实 404。验证初始 HTML，而不是只看 client 页面可打开。
- 表格和表单必须串起实际 mock 新建/编辑流程：校验、pending、成功回显、失败重试、取消、空状态；客户端与服务端共享边界校验。明确 mock 存储生命周期，不伪称持久化。
- 编辑不能丢正文或 slots；结构迁移处理旧 mock/session 数据。删除、认证、数据库等只在需求包含时增加。
- MDX 是文档正文来源，组件预览走共享渲染器。不要维护一套已经不用的旧文档模板或多份手抄示例。
- 保持语义、键盘可操作、可见焦点、标签关联及错误反馈，不用视觉效果掩盖缺失交互。

## 版本与交付边界

核实版本时优先使用 [Next.js](https://nextjs.org/docs/app)、[Tailwind CSS](https://tailwindcss.com/docs)、[pnpm](https://pnpm.io/workspaces)、[json-render](https://json-render.dev/docs) 官方文档及官方发布/包元数据。记录兼容性取舍，不在此 Skill 固定“永远最新”的版本数字。

按用户要求提供源码与可打开预览，明确公共/私有权限。Skill 不授予部署、公开仓库、安装全局 Skill 或变更账户权限的许可。只修改已授权目标；部署失败保留有效版本，确认原因后再重试，不绕过限制。

以实际证据交付：未执行的检查写明，部署成功不是线上登录后视觉/交互验收。不要用旧测试结果代替当前结果，也不要因文档-only 变更声称重新跑过整套应用构建。
