# 验证记录

验证日期：2026-10-20。记录实际执行结果，不以源码存在代替运行成功。

## 工具链

Node.js 24.19.0 / pnpm 12.14.0 / Next.js 16.4.2 / React 19.3.1 / Tailwind CSS 4.3.3 / json-render 0.21.1 / TypeScript 6.0.3。版本与 lockfile 未因本次内容重构而升级。

## 声明式协议修正

- content 为显式根节点树，每个节点声明 id / type / props 及可选 children / slots。
- 转换器仅展平结构并转换语义别名，节点数量和源树一致；不注入标题、描述、导航、默认容器或特殊 slot。
- h1 至 h6 与 p 使用受信任组件，布局由 JSON 明确声明，移除强制文章式 Document 排版。
- 三个独立项目文件声明不同组件树，工作台编辑同一树结构，旧会话数据通过 v3 key 隔离。
- 基础与应用 catalog / registry 分层，文档继续使用本地 MDX。

## 自动化验证结果

本次 lint、format、workspace typecheck、根目录 tsc、23 项测试、双站 production build 与 29 项真实 HTTP 检查全部通过。记录见 validation/*-declarative.log 和 validation/http-declarative.json。旧的 *-content.log 与 http-content.json 仅代表上一次内容块版本。

第一次构建在编译成功后的 TypeScript 阶段被资源限制以 137 终止；释放并行验证任务后，以 1024 MiB Node heap 和两核 CPU affinity 串行重跑两站成功。未跳过类型检查，也未改变源码构建配置。

核心测试检查每个源节点只映射一次、ID / props / children / slots 保真、h1 显式渲染、改变元数据不生成内容、删除标题不补回、叶节点不产生布局、嵌套与插槽 ID 唯一、拒绝未知类型及额外属性；交互测试覆盖编辑树、无效 JSON、保存、会话恢复。

HTTP 脚本检查三页 SSR、只在声明时出现的容量工具、9 篇 MDX、404，以及两站 POST / PATCH 共享树校验及保留。成功响应必须保留 content 并声明 serverStored: false。

## 明确边界

以上是源码构建、服务端 HTML、真实 HTTP 与 happy-dom 交互验证，不等于真实浏览器视觉或线上登录后的验收。

mock API 不写回源码或数据库。会话状态只保存在当前浏览器标签页；独立 SSR 路由仍展示仓库中的初始 JSON。正文编辑器是带共享校验的 JSON 协议编辑器，不是富文本编辑器。本例覆盖创建、读取和编辑，不包含删除。

预览站保持 owner-private，公开源码不改变预览权限。源码通过验证不代表已完成部署；发布版本由部署流程另行确认。未登录时看到登录页不能作为应用页面验收。
