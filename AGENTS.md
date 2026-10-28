# Web Standards 开发约束

本文件适用于本仓库。先检查受影响目录、package.json、测试与 Git 状态，保留用户已有改动。用户最新要求优先于旧版示例范围和可复用 Skill 的通用流程。

## 当前范围

仅保留 `apps/web` 的三个页面路由：`/`、`/projects/[slug]`、`/analytics/[slug]`，另有框架必需的根布局和 404 边界。动态路由按参数读取白名单中的实际数据，未知资源返回真实 404。不恢复工作台、模拟编辑、会话存储、写入 API、架构规范页或独立文档站。

## 技术与职责

- 保留 pnpm workspace、Next.js App Router、Tailwind CSS 和官方 json-render。依赖以 package.json 与 lockfile 为准；安装使用 frozen lockfile，普通修改不升级。
- `apps/web`：三个异步 Server Page、根布局、404。
- `packages/domain`：只读项目数据和声明式内容树 schema。
- `packages/data`：独立 JSON、白名单读取、首页组合、统计字段 map、应用外壳、Spec 校验。
- `packages/render`：`content-to-spec.ts` 纯转换器、catalog、registry、官方 Renderer 接入。
- `packages/ui`：自研基础 React 组件，不依赖业务数据、json-render 或应用。导航使用 next/link。
- 跨包使用 workspace 依赖和显式 exports，不从包外穿透内部路径。入口只导出；每个独立 UI 组件一个文件。按职责拆分，不为微小表达式添加抽象。

## 数据到页面

本地 JSON → schema → 显式 map → Spec → catalog / 引用校验 → registry → 官方 Renderer。

- 项目正文由独立 JSON 的 content 明确声明结构、内容、顺序与 slots。不同样例保留实际结构差异。
- `contentToSpec()` 每个源节点生成一个元素；h1…h6 → Heading(level)，p → Text。只转换协议，不补标题、导航、指标、布局或工具。项目元数据不自动插入正文。
- `pageSpec()` 单独添加应用 Frame 导航。统计 `display.json` 声明展示树，`mapping.ts` 只将渠道记录映射到指定表格的 rows，不扩展为通用绑定引擎。
- 未知组件、props、slots、重复 ID、缺失引用、循环和错列表格明确报错，不能静默忽略。JSON 不执行函数、JSX、任意模块或 HTML。
- 请求时 SSR；await 动态 params，未知 slug 调用 notFound。初始数据在服务器读取，不用客户端 fetch、ssr:false 或空壳替代首屏。
- 组件样式用 JSX 中完整、可静态扫描的 Tailwind utilities。共享 styles.css 仅 tokens 与必要 base；不引入外部 UI 库、组件选择器或 @apply。
- 保持原生语义、表头与 caption、键盘导航、可见焦点和窄屏可读性。零值与空集合分别处理。

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

`test:http` 先要求 build，临时启动 3200 端口的单个生产服务后关闭，不与同端口任务并行。测试应验证 JSON 增删/重排、props/children/slots 保真、不补标题或 slot、SSR、导航和真实 404，以及移除入口确实失效。

记录实际命令、结果和未覆盖项。单元、HTTP、真实浏览器、构建和部署是不同证据。资源不足可以限制并发后重试，不能跳过类型检查。不推送、不创建 PR、不部署或变更公开权限，除非用户另有明确授权；保留部署专用配置和凭证边界。

阅读顺序见 [中文阅读指南](docs/reading-guide.md)。可复用原则见 [build-json-render-web Skill](.agents/skills/build-json-render-web/SKILL.md)，其中编辑与 MDX 流程不属于当前简化范围。
