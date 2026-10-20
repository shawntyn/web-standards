# 声明式映射：正确边界与反例

在设计或修改内容 schema、mapper、registry 时阅读。以下树协议是可用示例，不是 json-render 唯一输入形式；目标 Spec 必须符合所安装的官方版本。

## 数据先声明，map 只适配

```json
{
  "id": "overview",
  "type": "Stack",
  "props": { "gap": "lg" },
  "children": [
    { "id": "title", "type": "h1", "props": { "text": "产品概览" } },
    {
      "id": "tool-card",
      "type": "Card",
      "props": { "title": "团队容量" },
      "slots": {
        "footer": [
          {
            "id": "planner",
            "type": "CapacityPlanner",
            "props": { "initial": 8 }
          }
        ]
      }
    }
  ]
}
```

这里 Stack、标题、Card、footer 与特殊组件都来自数据。转换可以把 `h1` 变为 `Heading` + `level: 1`，将嵌套 children/slots 展平为 ID 引用；不增加任何可见节点。特殊组件必须已经在代码内注册，不能靠 JSON 提供模块路径。

示意转换流程（使用项目实际类型与验证 API，不原样代替生产实现）：

```text
validatedRoot = validateSource(source)
mapNode(node):
  children = node.children.map(mapNode)
  slots = mapEachSlot(node.slots, nodes => nodes.map(mapNode))
  elements[node.id] = {
    type/props: adaptWhitelistedSemanticAlias(node.type, node.props),
    children,
    slots if explicitly present
  }
  return node.id
spec = { root: mapNode(validatedRoot), elements }
validateTargetSpecAndReferences(spec)
```

在校验后使用标准化对象，不继续读未校验原对象。缺失 children 可按目标协议变成空数组；这类无可见内容的协议规范化不是添加页面内容。数组顺序与槽名不可被“美化”重排。

## 单根与多根边界

目标 Spec 要求单个 root 时，布局根应在源数据中显式声明。若输入只有两个并列顶层节点，不得为了凑 root 偷偷包一个 Stack / Document：应先补齐明确的数据协议约定。其他项目可以设计受支持的多根适配（例如分别转换并渲染），但必须显式约定、验证布局与语义，并说明行为；不能把它当成当前项目已经具备的能力。本仓库 web-standards 当前实现采用单根 schema；其他项目按实际协议处理。

## 反例：map 擅自写页面

```ts
// 错：源只有项目元数据，mapper 却发明了完整页面。
return {
  root: "page",
  elements: {
    page: {
      type: "Document",
      props: {},
      children: ["title", "stats", "planner"],
    },
    title: {
      type: "Heading",
      props: { level: 1, text: project.name },
      children: [],
    },
    stats: {
      type: "Metric",
      props: { label: "项目进度", value: "84%" },
      children: [],
    },
    planner: { type: "CapacityPlanner", props: { initial: 8 }, children: [] },
  },
};
```

把这些硬编码搬到另一个函数仍然错误。正确做法是让展示协议明确声明这些节点，或在需求明确为固定业务视图时另建有清楚契约的视图，不伪装成“纯正文 mapper”。项目 name/description 可供列表/SEO，不能自动成为正文 h1/段落。

## 组件默认与源数据的界线

- 合法：Heading 的默认 Tailwind 字号；Button 的焦点状态；交互工具自己的标签和计算结果；Card 内部语义容器。
- 不合法：mapper 看到某业务字段就新增 Card；源未声明 slot，mapper 自动塞一个工具；为了“像 Markdown”强加 72ch 容器或覆盖全部标题样式。
- 数据可声明布局组件并采用组件默认 props；不必把所有 CSS 类名塞入 JSON。相反，不应开放任意 class/HTML/脚本以逃避类型约束。

## 示例应证明什么

一份可以是带 Grid/Metric 的概览，一份是分段内容，一份是表格和说明混合；只是候选，不要求固定三类。它们复用同一协议但真实声明不同树和顺序。特殊 slot 只出现在源明确需要它的例子，不强塞到每页。

独立 JSON 文件不是消除共享 schema。合理共享类型、组件与 mapper，分别维护内容；不要“同一数组里三条同构数据”或“复制三份转换器”冒充多样性。
