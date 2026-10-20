# Web Standards 开发约束

本文件适用于本仓库。它记录项目已确定的选择，不代表所有 Web 项目都必须照搬。修改前读受影响目录、`package.json`、相关测试；保留用户最新要求和已有功能。

## 不可退回的边界

- 使用 pnpm workspace、Next.js App Router、Tailwind CSS 和官方 json-render。依赖版本以 `package.json`、`packageManager`、`pnpm-lock.yaml` 为准；安装使用 frozen lockfile，禁止部署时隐式升级。
- 新建或明确升级时核实官方当前稳定版、支持矩阵与迁移说明；选择相互兼容的组合并记录例外。普通修复不顺便升级，不以跳过类型检查换取“最新版”。
- 基础 UI 自行实现，不引入外部 UI 组件库。每个独立组件一个文件，入口只导出；不要将组件、状态、存储、校验、读取、页面映射塞进一个入口。
- 组件样式用 JSX 中完整、可静态扫描的 Tailwind utilities。`packages/ui/src/styles.css` 仅保留导入、tokens、必要全局 base，不恢复 `.card` / `.button` 等组件选择器或 `@apply`。连续运行时数值可通过 CSS 变量交给静态 utility，不借此改回整套 inline styles。
- 项目详情是声明式 JSON 驱动，不是固定模板，也不是 Markdown 排版器。JSON 声明 h1 就渲染 h1；内容、顺序、布局和命名 slots 来自源数据。mapper 只校验和转换协议，不补标题、说明、返回按钮、容器、指标或特殊组件。
- 当前内容协议每个源节点对应一个 Spec 元素；语义别名 `h1…h6 → Heading(level)`、`p → Text` 不增加节点。组件自己的语义 DOM、默认样式和必要交互行为不受“一节点”限制。
- 不同项目数据分别存文件，展示有意义的不同组件树。共享 renderer 和协议，不复制 mapper，也不以同模板换数字充当多个结构示例。
- 页面内容和组件演示经过官方 json-render Renderer。禁止改成手写 JSX 页面树来绕过协议。Next 根文档、路由边界和文档 MDX 正文是独立层；不得把它们混进详情 mapper。

## 目录与依赖

- `apps/web`：主站、动态项目路由、mock API。
- `apps/docs`：独立组件文档应用，本地 MDX 是文档正文唯一来源，交互示例仍走 json-render。
- `packages/ui`：基础组件和主题；不依赖业务数据、应用或 json-render。本项目 UI 包明确面向 Next.js，导航使用 next/link。
- `packages/domain`：内容与业务 schema、草稿、集合变更、mock mutation 校验。入口只导出。
- `packages/data`：逐项目 JSON、仓储读取、页面映射与校验。入口只导出。
- `packages/render`：catalog、registry、官方 Renderer 接入、纯内容转换器及受信任特殊组件。基础 registry 不反向引入工作台，避免循环依赖。
- `tests`：行为和契约测试；`scripts/verify-production.mjs`：真实生产服务 HTTP 检查。

通过 workspace 依赖和 package exports 跨包引用，不从应用或包外相对路径穿透内部实现。`apps/web` 与 `apps/docs` 是独立构建/部署边界；`app/(group)` 只能组织单个 Next 应用，不能替代它们。拆分按职责，不为每个微小表达式建文件。

## 数据、渲染与交互

读取逐项目静态 JSON → domain schema → 显式 map 转 Spec → catalog / 引用校验 → registry → 官方 Renderer。详情转换入口为 `packages/render/src/projects/project-content-spec.ts`，复用视图为 `ProjectSpecViewRender`。

- 校验未知类型/props/slots、重复 ID、引用完整性及结构限制；错误不得静默过滤或改成空白成功。
- JSON 不包含函数、JSX、任意模块路径或可执行 HTML。特殊组件预先注册；slots 在源、catalog、registry、UI 接收端四层对应，不由 mapper 偷偷创建。
- 保持请求时 SSR、异步动态路由参数、未知 slug 的真实 404。初始数据在服务器读取，不用客户端 fetch / `ssr:false` / 空壳替代首屏；交互才进入最小 client 边界。
- 工作台要有表格和表单的可执行闭环：读取、选择/查看、新建、编辑、校验、提交中、成功回显、失败重试、取消及空状态。写入经过 mock HTTP 和共享校验，不能只有按钮外观。删除是新增业务范围，不在当前实现中，不凭“完整流程”擅自加入。
- 编辑必须保留整棵 content 与 slots；改变 schema 时处理旧 session 数据兼容或显式失效。当前 mock 仅在标签页会话保留，不宣称数据库持久化或跨端同步。
- 保留原生语义、标签关联、键盘/焦点、禁用与错误状态；表格标题/表头明确，交互反馈可被辅助技术感知。

## 验收与交付

在仓库根目录运行，按变更范围选择；变更渲染/数据/交互时执行完整链路：

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:http
```

`pnpm test:http` 需要先 build，会临时启动 3200/3201 两个生产服务并关闭。不要与其他占用这些端口的任务并行。`pnpm dev` 是开发服务；不能把开发启动当作 production build 通过。

必须验证：增删/重排 JSON 后输出相应变化；删除 h1 或 slot 不被补回；更改非正文元数据不凭空改变详情；节点数、props、children、slots 保真；真实表单操作保留内容；动态路由 HTML/404、mock 成功与失败分支、MDX 示例可用。测试不得仅匹配文档措辞。

记录实际执行命令、结果和未覆盖项。DOM、SSR、HTTP、构建成功、部署成功、登录后浏览器验收是不同证据，不互相替代。资源不足应合理限制并行后重试，不关闭类型/错误检查。

用户交付要求是可打开的预览链接与公开 GitHub 源码，不以压缩包代替；现有预览保持 owner-private。此处不是公开部署或扩大权限的长期授权。更新前核对目标与本次授权，保留部署专用配置，不将凭证或本地环境配置提交到仓库。

## 复用

跨项目使用 [build-json-render-web Skill](.agents/skills/build-json-render-web/SKILL.md)。该 Skill 提供可移植原则、正反例、验收项和 AGENTS 模板；本文件负责当前仓库实际路径与命令。
