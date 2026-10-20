import type { ProjectDraft } from "@repo/domain";
export const fields: {
  name: keyof ProjectDraft;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  description?: string;
}[] = [
  { name: "name", label: "项目名称", type: "text" },
  {
    name: "slug",
    label: "项目标识",
    type: "text",
    description: "小写字母、数字、连字符；创建后不可修改",
  },
  { name: "category", label: "分类", type: "text" },
  { name: "status", label: "状态", type: "select" },
  {
    name: "description",
    label: "项目描述",
    type: "textarea",
    description: "10–1000 个字符",
  },
  {
    name: "features",
    label: "功能清单",
    type: "textarea",
    description: "每行一项，最多 12 项；可留空",
  },
  {
    name: "content",
    label: "正文内容块（JSON）",
    type: "textarea",
    description:
      '按数组顺序呈现。例：[{"id":"intro","type":"paragraph","text":"正文"}]；每块 ID 唯一，支持标题、段落、列表、引文、代码、表格等。',
  },
  { name: "progress", label: "进度（0–100）", type: "number" },
  { name: "members", label: "成员数", type: "number" },
  { name: "tasks", label: "任务数", type: "number" },
];
