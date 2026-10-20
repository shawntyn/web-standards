import ContentModel from "../content/components/content.mdx";
import Primitives from "../content/components/primitives.mdx";
import Card from "../content/components/card.mdx";
import Button from "../content/components/button.mdx";
import Metric from "../content/components/metric.mdx";
import Slot from "../content/components/slot.mdx";
import Workflow from "../content/components/workflow.mdx";
import Table from "../content/components/table.mdx";
import Form from "../content/components/form.mdx";

// Explicit local allowlist: never resolve untrusted route text into a file path.
export const documents = [
  {
    slug: "content",
    title: "内容驱动渲染",
    description: "独立 JSON 文档、顺序映射与简洁阅读排版",
    Content: ContentModel,
  },
  {
    slug: "primitives",
    title: "基础组件",
    description: "布局、标题、文本、状态与代码",
    Content: Primitives,
  },
  {
    slug: "card",
    title: "Card",
    description: "组合容器与命名插槽",
    Content: Card,
  },
  {
    slug: "button",
    title: "LinkButton",
    description: "导航与操作的语义边界",
    Content: Button,
  },
  {
    slug: "metric",
    title: "Metric",
    description: "有上下文的指标展示",
    Content: Metric,
  },
  {
    slug: "slot",
    title: "Named slots",
    description: "受信任特殊交互组件扩展",
    Content: Slot,
  },
  {
    slug: "table",
    title: "Table",
    description: "列表、筛选、行操作与空状态",
    Content: Table,
  },
  {
    slug: "form",
    title: "Form",
    description: "输入、校验、提交和错误恢复",
    Content: Form,
  },
  {
    slug: "workflow",
    title: "编辑工作流",
    description: "SSR、JSON 映射与 mock API 的完整边界",
    Content: Workflow,
  },
];
export function getDocument(slug: string) {
  return documents.find((doc) => doc.slug === slug);
}
