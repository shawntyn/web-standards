# Web Standards 开发约束

本文件适用于本仓库。先检查受影响目录、package.json、测试与 Git 状态，保留用户已有改动。用户最新要求优先于旧版示例范围和可复用 Skill 的通用流程。

## 当前范围

仅保留首页与数据决定的项目详情：`/`、`/projects/[slug]`。附带 Atlas / Orbit 两个 JSON 样例，项目数量不在代码中固定。只有 `page.tsx` 与 `projects/[slug]/page.tsx` 两个页面路由文件，另有框架必需的根布局和 404 边界。动态路由按 slug 查找已校验的项目列表，未知资源返回真实 404。不恢复 analytics、工作台、模拟编辑、会话存储、写入 API、架构规范页或独立文档站。

## 技术与职责

- 保留 pnpm workspace、Next.js App Router、Tailwind CSS 和官方 json-render。依赖以 package.json 与 lockfile 为准；安装使用 frozen lockfile，普通修改不升级。
- `apps/web`：首页与共享动态项目路由、根布局和公共导航、404。不要为 Atlas 和 Orbit 复制固定页面。
- `packages/domain`：只读项目数据和声明式内容树 schema，分别放在 `project-schema.ts` 与 `content-schema.ts`。
- `packages/data`：`src/projects` 中的独立 JSON、目录读取、首页组合、Spec 校验。首页及其专用卡片映射集中在 `src/home-spec.ts`，不为这段只服务首页的逻辑另建单文件中间目录。
- `packages/render`：`content-to-spec.ts` 纯转换器、catalog、registry、官方 Renderer 接入。
- `packages/ui`：自研基础 React 组件，不依赖业务数据、json-render 或应用。导航使用 next/link。
- 跨包使用 workspace 依赖和显式 exports，不从包外穿透内部路径。入口只导出；每个独立 UI 组件一个文件。按职责拆分，不为微小表达式添加抽象。
- 命名检查覆盖 JSON type、属性 schema、catalog、registry、UI 导出、文件名和当前文档。基础组件使用 `Button`、`List`、`Table` 等直接名称，不添加没有实际区分作用的前缀。组件名使用 PascalCase，文件名使用 kebab-case；页面 Spec 文件与函数对应，如 `home-spec.ts` / `homeSpec()`。这些是本项目约定，不称作 json-render 强制规范。
- 公共外框使用 `AppShell` / `app-shell.tsx`，由根 `layout.tsx` 直接使用，不注册到 catalog / registry。Spec 只描述正文，不设外框保留 ID。源正文节点类型为 `ContentNode`，组件属性校验规则集合为 `componentPropsSchemas`；变量名区分源 `content` 与转换后的 `contentSpec`。
- 当前 `Button` 接收 `label` 与必填 `href`，通过 Next Link 输出原生链接；不为改名添加无行为的按钮、额外 variant 或兼容旧名称的别名。修改组件名称时同步所有使用位置，并检查同类问题，而非只修改用户点名处。

## 数据到页面

本地 JSON → schema → 显式 map → Spec → catalog / 引用校验 → registry → 官方 Renderer。

- 项目正文由独立 JSON 的 content 明确声明结构、内容、顺序与 slots。不同样例保留实际结构差异。
- `getProjects()` 每次调用都读取固定数据目录，按文件名字典顺序读取直接子级的普通 `.json` 文件，不递归、不跟随符号链接，不保留模块级项目列表缓存。新增、修改或删除运行环境中的 JSON 后，完整刷新页面即可读取变化。URL 参数不参与文件路径拼接。
- 组件属性规则集中在 `packages/domain/src/component-props-schema.ts`，源内容 schema 与 catalog 共同引用。每份读出的项目列表通过 `ProjectListSchema` 一次校验元数据、正文和 slug 唯一性；无效 JSON 或 schema 校验失败明确抛错。转换器接收已校验的 `ContentNode`，不重复解析。最终 Spec 的组件属性、slots 与引用校验仍保留。
- `contentToSpec()` 每个源节点生成一个元素；h1…h6 → Heading(level)，p → Text。只转换协议，不补标题、导航、指标、布局或工具。项目元数据不自动插入正文。
- 根 `layout.tsx` 读取项目列表，按 name / slug 生成导航并用 AppShell 包住 children，首页、详情和 404 共用。layout 与页面分别调用同一 `getProjects()` 入口，不另维护导航列表；客户端跳转可能复用 layout，完整刷新重新读取。详情走 JSON → contentToSpec → validateSpec → SpecView / 官方 Renderer；首页的 `homeSpec(projects)` 与 404 正文同样保留最终 Spec 校验。
- 手写 Spec 直接使用官方 `root`、`elements`、`type`、`props`、`children`、`slots` 对象结构，不为创建普通元素对象增加 `node()` 等辅助封装。
- 未知组件、props、slots、重复 ID、缺失引用、循环和错列表格明确报错，不能静默忽略。JSON 不执行函数、JSX、任意模块或 HTML。
- 默认子内容使用 `children`，不接受命名槽 `slots.default`。组件的属性校验与 UI 类型保持一致；标题级别由数据明确表达，例如 `Card.titleLevel`，不能用固定级别造成样例标题跳级。
- 请求时 SSR；await 动态 params，未知 slug 调用 notFound。初始数据在服务器读取，不用客户端 fetch、ssr:false 或空壳替代首屏。
- 组件样式用 JSX 中完整、可静态扫描的 Tailwind utilities。共享 styles.css 仅 tokens 与必要 base；不引入外部 UI 库、组件选择器或 @apply。
- 保持原生语义、表头与 caption、键盘导航、可见焦点和窄屏可读性。

## 验证与交付

从仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:http
```

`test:http` 先要求 build，临时启动 3200 端口的单个生产服务后关闭，不与同端口任务并行。测试应验证目录中 JSON 增删与文件名排序、非法数据和重复 slug 报错、正文增删/重排、props/children/slots 保真、不补标题或 slot、首页和样例详情 SSR、导航与数据一致、无效 slug 的真实 404，以及移除的 analytics 地址确实失效。

Next 服务按项目脚本从 `apps/web` 启动，默认数据路径相对此工作目录解析；单测显式传入源目录或临时目录。部署必须包含 `packages/data/src/projects` 及其 JSON，并保留相对目录关系；Next 文件追踪配置需覆盖这些文件。不可变部署新增数据仍需正常构建发布，不保证本地源码变化自动同步线上。

记录实际命令、结果和未覆盖项。单元、HTTP、真实浏览器、构建和部署是不同证据。资源不足可以限制并发后重试，不能跳过类型检查。不推送、不创建 PR、不部署或变更公开权限，除非用户另有明确授权；保留部署专用配置和凭证边界。

阅读顺序见 [中文阅读指南](docs/reading-guide.md)。可复用原则见 [build-json-render-web Skill](.agents/skills/build-json-render-web/SKILL.md)，其中编辑与 MDX 流程不属于当前简化范围。
