# JSON 转换简化验证

日期：2026-10-29。范围：合并组件属性规则、移除正文的重复解析，保留现有 JSON、转换逻辑和最终 Spec 校验。

## 改动

- `packages/domain/src/component-props.ts` 是共享属性规则的唯一来源，内容 schema 和 catalog 共同引用。源 JSON 原有的长度、数量、枚举、严格字段和表格列数限制保留；手写目标 Spec 也遵守相同限制。
- `project-repository.ts` 通过 `ProjectListSchema` 校验项目和正文；`contentToSpec(content: ContentBlock)` 只转换已校验的输入。处理其他原始数据时，调用方先做 `ContentSchema.parse(raw)`。
- 最终 Spec 仍逐组件校验 props，并检查 slots、缺失引用、循环和未使用节点；`catalog.validate()` 不能独自替代这些检查。
- 两个 JSON、路由、registry 和 UI 组件均未修改；节点 ID、顺序、h1…h6 / p 别名和命名 slots 保持原有含义。

## 实际命令与结果

环境：Node.js 24.19.0、pnpm 12.14.0。以下命令均从仓库根目录执行。Corepack 使用临时可写缓存，每个 pnpm 命令均带 `COREPACK_HOME=/private/tmp/web-standards-corepack` 前缀。

| 命令                                                                                                                         | 结果                                                          |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm install --frozen-lockfile --store-dir /private/tmp/web-standards-pnpm-store --registry https://registry.npmmirror.com` | 通过；锁文件与依赖版本未变                                    |
| `pnpm format:check`                                                                                                          | 通过                                                          |
| `pnpm lint`                                                                                                                  | 通过                                                          |
| `pnpm typecheck`                                                                                                             | 所有 workspace 和根目录测试类型检查通过                       |
| `pnpm test`                                                                                                                  | 9 项通过，0 失败                                              |
| `pnpm build`                                                                                                                 | 默认 Turbopack 生产构建通过；仍为首页、共享项目路由与框架 404 |
| `pnpm test:http`                                                                                                             | 26 项通过；3200 端口生产服务已自动关闭                        |
| `git diff --check`                                                                                                           | 通过                                                          |

测试覆盖读取入口拒绝未知组件、非法 props / slots、重复 ID 和错列表格；正文增删重排、一节点一元素、props / children / slots 保真、不补标题或 slot；最终 Spec 拒绝错误 text 类型、无效标题级别和错列表格等。另对 h1…h6、源标题拒绝 props.level、空白表格单元格进行了实际解析、转换与输出校验。

[本次 HTTP 明细](http-simplified.json) 验证三页 SSR、全部站内导航目标、无效 slug、analytics 和旧写入入口的真实 404。

## 浏览器与覆盖边界

通过 Codex 内置浏览器访问本地 3000 端口开发服务，点击首页的“打开 Atlas 项目”，再点击 Card footer 的“阅读 Orbit 项目”。三页标题和正文正常，Atlas 任务列表、footer 链接和 Orbit 表格可见；读取到的浏览器 error / warn 日志为空。

本次浏览器检查仅覆盖上述页面与导航，没有重跑此前完整的窄屏、键盘、刷新、全部无效路径或多浏览器检查。生产 SSR 与 404 由本次 HTTP 检查验证。没有部署、推送或创建 PR。

## 同日追加：目录收拢

按用户确认的方案，将首页结构与专用卡片映射合并到 `packages/data/src/home-spec.ts`，移除空的 `pages`、`mapping` 目录；`packages/domain/src/content.ts` 重命名为 `content-schema.ts`，同步包入口、内部引用、AGENTS 和阅读指南。四个共享包的职责与公共导出名称保持不变。

合并前将 `homeSpec()` 输出保存在临时文件，合并后用 `assert.deepEqual` 比较，首页 Spec 完全一致。随后重新执行本页记录的 frozen install、format、lint、typecheck、test、build、test:http 命令，全部通过；仍为 9 项单测和 26 项生产 HTTP 检查。源码和当前阅读文档中的旧路径引用已清除，历史验证记录保留原文。

目录调整后，通过内置浏览器重新打开首页并点击“打开 Atlas 项目”，首页卡片和 Atlas 正文正常，浏览器 error / warn 日志为空。本轮未重跑完整浏览器回归；无新增部署。

## 同日追加：项目目录自动读取

用户确认以目录中的 JSON 决定项目集合，替代原先固定 Atlas / Orbit 清单。`getProjects()` 在请求期间读取直接子级普通 `.json` 文件，按文件名排序，每份列表通过 `ProjectListSchema` 校验。首页、详情和导航显式使用同一份列表；导航文字取 name，链接取 slug。404 页同样按请求读取。没有永久缓存、目录扫描生成脚本或新增依赖。

Next 服务以 `apps/web` 为工作目录，默认读取 `../../packages/data/src/projects`；测试显式传入独立目录。`outputFileTracingRoot` 与 `outputFileTracingIncludes` 覆盖项目 JSON，HTTP 脚本检查首页、详情和 404 的实际追踪文件。不可变部署仍需要正常构建发布以包含新增 JSON；本地刷新不会修改线上部署。

重新执行本页列出的安装、格式、lint、类型检查、测试、构建和 HTTP 命令，最终全部通过：

- **14 项单测**：新增临时目录的增删发现、排序、文件名与 slug 独立、非 JSON / 子目录 / 符号链接过滤、损坏 JSON / 非法 schema / 重复 slug 拒绝；新增项目通过真实 Renderer 显示首页卡片、导航和正文。
- **33 项生产 HTTP 检查**：同一服务进程运行期间新增 JSON 后，首页和详情立即可访问；修改 name 更新卡片及导航；删除后入口消失、详情返回真实 404。检查项目 JSON 已纳入产物追踪。临时文件使用唯一名称并在 finally 清理，服务结束后关闭 3200 端口。
- **合法 slug 冲突回归**：`foo` 与 `foo-link` 曾会导致旧首页节点命名冲突，现卡片和链接使用不同前缀；测试验证两张独立卡片及其详情链接。未知 slug 的 HTTP 断言以实际项目集合为准，不禁止新增名为 constructor、field 等合法项目；主导航检查与 JSON 正文自定义链接分开。
- **生产浏览器检查**：先打开 3200 端口首页，再添加临时 JSON；刷新后出现新卡片和导航，点击后正文及网页标题正确，正常页面无 error / warn 日志。直接访问未知项目时可见 404 和新项目导航；删除 JSON 后新项目地址也显示 404，导航恢复。临时文件已移除，验证服务已关闭。

初次 HTTP 检查将项目 404 导航当作普通 HTML 链接断言，未通过。查证 Next 错误恢复可通过 RSC 传输 not-found 内容后，分别检查 HTTP 404 状态、错误边界中的新项目数据和真实浏览器导航。全局未匹配路由另外检查实际 HTML 导航；不将 RSC 文本匹配称为 404 的完整 SSR 验证。最终构建中首页、项目详情及框架 404 都为动态路由。

本轮未重跑完整的窄屏、键盘或多浏览器检查；未部署、推送或创建 PR。开发服务 3000 端口首页另已确认 HTTP 200。

## 同日追加：直接书写 Spec 与冗余检查

删除 `spec-node.ts`，首页和应用外壳直接写官方 `type / props / children` 元素对象，保留 `root / elements` 结构及原有内容、顺序和 ID。检查其他封装后，将只被 `ContentTable` 使用的 `Table` 外壳合入该组件，删除 `table.tsx` 和无人使用的独立导出；表格的 caption、表头 scope、空态、样式和滚动容器保留。

共享属性 schema、源数据校验、最终 Spec 校验、registry 适配和 SpecView 的客户端边界继续保留，它们各有实际职责。曾尝试清理默认 React 导入，但现有 `node --import tsx` 单测出现 `React is not defined`，因此恢复全部相关导入，没有更改测试运行配置。

重新执行上述 frozen install、format、lint、typecheck、test、build、test:http：全部通过，**14 项单测、33 项生产 HTTP 检查**。额外通过 `pnpm exec tsx -e` 渲染空表，检查 caption、两个 `scope="col"` 表头、`colSpan="2"` 的“暂无数据”和横向滚动类名。依赖与锁文件未变，临时 JSON 和 3200 端口服务已清理。

浏览器从 3000 端口首页点击进入 Orbit，再刷新检查：表格内容正常，caption、表头 scope、两行数据和滚动容器均存在。开发工具记录了一次文件修改触发的 Fast Refresh 全量刷新提示，无应用 error。没有重跑完整窄屏、键盘或多浏览器检查，也未部署。

## 同日追加：三处收尾清理

按用户确认移除 Stack / Grid / Card 在 `.extend()` 后重复的 `.strict()`，保留基础节点及 slots 对象的严格校验；Heading 的数值级别改用 `z.literal([1, 2, 3, 4, 5, 6]).optional()`；删除 render 包入口中无人使用的 registry 导出，内部注册与 Renderer 接入保留。

重新执行上述 frozen install、`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm test:http`，全部通过：14 项单测、33 项生产 HTTP 检查。针对性复核确认扩展节点仍拒绝额外字段和未知 slot，标题级别接受缺省与合法数字、拒绝 7 和字符串，源 h1 仍拒绝 props.level。源码与文档的 `git diff --check` 通过。

未新增依赖或测试文件，未更改 JSON、页面结构或数据读取方式。本轮没有重新运行真实浏览器检查；HTTP 临时 JSON 已清理，3200 生产服务已关闭，未部署。

## 同日追加：组件命名与一致性检查

用户确认统一组件名称并要求主动检查同类问题。本轮将 LinkButton / ContentList / ContentTable 改为 Button / List / Table，同步 JSON type、共享属性 schema、catalog、registry、UI 文件和导出、首页 Spec 及测试。没有保留旧名称别名。`page-shell.ts` 更名为 `page-spec.ts`，与 `pageSpec()` 和 `home-spec.ts` 对齐；创建节点基础 schema 的 `leaf()` 改名为 `nodeSchema()`。当前阅读指南和 AGENTS 同步命名约定，历史验证记录保留当时名称。

独立检查还发现并修复：

- 最终 Spec 曾接受 `slots.default`，官方 Renderer 会警告并丢弃其中内容。现在在渲染前明确报错，默认内容只使用 children；原有非法 Spec 测试加入 Stack / Card 回归。修复前测试确实失败，修复后通过。
- Grid 的 UI 类型原先接受任意 number，现与 schema 一致，只接受 1–4 列。
- Card 新增可选 titleLevel（默认 3），Atlas 明确指定 2，修正 h1 到 h3 的跳级。首页仍为 h1 / h2 / h3，原有卡片标题字号和样式保持不变。测试覆盖标题语义及非法级别、非法列数。

检查了四包依赖和显式 exports、组件原生语义、props / children / slots 传递、动态路由与文件读取边界、移除功能残留和当前文档；未发现需要另建抽象或恢复旧功能的情况。Button 仍以必填 href 交给 Next Link，没有引入按钮事件、variant 或额外封装。

重新执行上述 frozen install、`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm test:http`，最终全部通过：14 项单测、33 项生产 HTTP 检查。格式检查首次发现 Grid 的 JSX 换行需整理，Prettier 修正后通过。依赖和锁文件未改。

通过临时的 `pnpm exec tsx -e` 脚本保存并比较变更前后的真实 Renderer 输出：单独改名时首页、Atlas、Orbit HTML 完全一致；完成全部修正后，仅 Atlas 的“本周安排”标签由 h3 变为 h2，其他 HTML 完全一致，JSON 仅组件名和明确的 titleLevel 变化。活动源码及当前文档已无旧组件名和 page-shell 路径，`git diff --check` 通过。

浏览器从 3000 首页点击“打开 Atlas 项目”，确认“本周安排”为 h2 且原 class 不变；点击“阅读 Orbit 项目”并刷新，表格 caption、两个 scope=col 表头和两行内容正确，warn / error 日志为空。未重跑完整窄屏、键盘或多浏览器检查。生产 HTTP 的临时 JSON 和 3200 服务已清理；3000 开发服务恢复运行，未部署、推送或创建 PR。

## 同日追加：外框与全项目命名复核

用户确认外框采用 AppShell，并要求检查项目所有命名。本轮同步组件实现、文件、导出、catalog、registry 和页面 Spec：`Frame` → `AppShell`，`frame.tsx` → `app-shell.tsx`，根元素 ID `site-frame` → `shell`。这些是本项目的命名选择，json-render 并不强制使用它们。`pageSpec()` / `page-spec.ts` 继续负责页面组合。

全项目复核后，还调整了几处含义不够准确的名称：

- 属性校验规则集合 `componentProps` → `componentPropsSchemas`，文件 `component-props.ts` → `component-props-schema.ts`，与其他 schema 文件一致。
- 递归正文类型 `ContentBlock` → `ContentNode`，内部递归 schema → `ContentNodeSchema`，私有类型 `Kind` / `Node` → `ContentType` / `ContentNodeBase`。公开的 `ContentSchema` 仍负责整棵正文树的校验。
- 首页中同时保存卡片和链接的 `cards` 字典 → `projectElements`；`pageSpec` 参数和详情页中的转换结果变量 → `contentSpec`，区分源正文与转换结果。

同步了所有引用、测试、README、阅读指南和 AGENTS；保留含义清楚的 `getProjects`、`getProject`、`homeSpec`、`pageSpec`、catalog 和 registry。README 说明了 AppShell 组件名与 shell 元素 ID 的区别。历史验证记录保留当时的名称。独立复核未发现活跃源码或当前阅读文档中的旧名称残留。

本轮再次执行上述 frozen install、format、lint、typecheck、test、build、test:http，全部通过：**14 项单元测试、33 项生产 HTTP 检查**。保留 ID 的已有用例同步为合法 Stack 内容，并明确匹配 `正文不能使用保留 ID：shell`，避免因其他校验错误而误通过。

通过临时 `pnpm exec tsx -e` 脚本，用 `assert.deepEqual` 比较本轮改名前后解析的项目 JSON 及官方 Renderer 输出：首页、Atlas、Orbit HTML 完全一致。HTTP 再次验证运行中增改删 JSON、导航、SSR 和真实 404；临时 JSON 已清理，3200 服务已关闭。依赖和锁文件未变，`git diff --check` 通过。本轮未另做真实浏览器、窄屏、键盘或多浏览器检查，未部署、推送或创建 PR。

## 同日追加：公共外框移入 Next layout

用户确认由 Next 管公共布局、json-render 管正文。根 `layout.tsx` 现在直接调用 UI 的 `AppShell`，读取项目目录并生成导航。删除 `packages/data/src/page-spec.ts` 及导出、AppShell 的 catalog / registry 条目和 `shell` 保留 ID 检查；正文可正常使用 `shell` 作为节点 ID。未改变 AppShell 的 HTML、样式或链接行为。

请求时渲染的 `connection()` 集中到根 layout，首页与详情移除重复调用；404 不再读取项目列表，改为同步渲染正文并复用根外框。首页、详情与 404 仍各自执行 `validateSpec()` 后交给官方 Renderer，没有删除属性、slots 或引用校验。应用及包源码相对本轮开始净减少 32 行，删除一个包装文件，未新增实现文件。

layout、页面和 metadata 仍通过同一个 `getProjects()` 入口读取，不缓存项目列表，也不维护另一份导航配置。它们分别调用读取函数，并非共享同一个数组。完整刷新会重新读取运行环境 JSON；站内客户端导航会复用 layout，不保证每次点击重读导航。README 流程图、文件职责表、阅读指南和 AGENTS 已同步这些边界。

重新执行上述 frozen install、format、lint、typecheck、test、build、test:http，最终全部通过：**14 项单元测试、33 项生产 HTTP 检查**。构建仍只包含动态首页、共享项目详情和框架 404。HTTP 验证正常页面与全局 404 只有一份 nav / main，导航与项目列表一致；同一服务运行期间新增、修改、删除 JSON 后首页、详情和 404 按预期更新。依赖和锁文件未变；render 的固定 Zod 依赖继续满足 json-render core 的 peer dependency。

首次 HTTP 检查把动态项目 404 的导航当作直接输出的 HTML，断言失败。检查响应确认该路径仍返回真实 404，但 Next 通过 RSC 错误边界恢复页面，原始响应中没有 nav / main。脚本改为分别验证状态、404 文案和 RSC 中的导航数据，正常页与全局 404 保留严格 HTML 断言；没有把 RSC 文本检查称为完整首屏渲染证据。

真实浏览器通过临时生产服务检查动态 404 → 首页 → Atlas → Orbit，标题、列表、表格和链接正常，外框只有一份。再新增一份临时 JSON（正文 ID 为 shell），完整刷新后导航出现新项目，点击可看到其正文；动态 404 也包含新项目导航。删除 JSON 后完整刷新，404 中的该导航项消失；动态与全局 404 最终 DOM 均只有一个 nav 和 main。正常导航检查阶段 warn / error 日志为空。

额外将本轮修改前的项目 JSON 和整页组件渲染输出保存为基线，与修改后直接组合 AppShell / SpecView 的输出作 `assert.deepEqual`：首页、Atlas、Orbit HTML 及 JSON 完全一致。临时 JSON、浏览器验证标签和 3200 生产服务均已清理，`git diff --check` 通过。未重跑完整窄屏、键盘或多浏览器回归，未部署、推送或创建 PR。

## 提交前复核：2026-10-30

用户明确授权提交并推送上述改动。提交前重新执行本页列出的 frozen install、`pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm test:http`，全部通过：14 项单元测试、33 项生产 HTTP 检查。依赖和锁文件未变，HTTP 临时项目及 3200 服务已清理。本次未改应用实现，也未重新运行真实浏览器或部署验证；前文浏览器记录仍对应各自当时的检查。
