import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";
import { ProjectListSchema } from "@repo/domain";
const text = z.string();
const link = z.object({ label: text, href: text });
export const catalog = defineCatalog(schema, {
  components: {
    ProjectWorkbench: {
      props: z.object({ initialProjects: ProjectListSchema }),
      description: "真实 HTTP 校验与标签页隔离的 Mock CRUD 工作台",
    },
    Frame: {
      props: z.object({ brand: text, subtitle: text, links: z.array(link) }),
      slots: ["default"],
      description: "应用外壳，内容仍由 spec 管理",
    },
    Stack: {
      props: z.object({ gap: z.enum(["sm", "md", "lg"]).optional() }),
      slots: ["default"],
      description: "纵向布局",
    },
    Split: { props: z.object({}), slots: ["default"], description: "双栏布局" },
    Grid: {
      props: z.object({ columns: z.number().int().min(1).max(4).optional() }),
      slots: ["default"],
      description: "响应式卡片网格",
    },
    Heading: {
      props: z.object({
        text,
        level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        eyebrow: text.optional(),
      }),
      description: "语义化标题",
    },
    Text: {
      props: z.object({ text, tone: z.enum(["default", "muted"]).optional() }),
      description: "文本",
    },
    Badge: {
      props: z.object({
        text,
        tone: z.enum(["neutral", "success", "accent"]).optional(),
      }),
      description: "状态标签",
    },
    Card: {
      props: z.object({ title: text.optional(), description: text.optional() }),
      slots: ["default", "header", "footer"],
      description: "带 header / footer 命名插槽的卡片",
    },
    LinkButton: {
      props: z.object({
        label: text,
        href: text,
        variant: z.enum(["primary", "secondary"]).optional(),
      }),
      description: "导航按钮",
    },
    Code: {
      props: z.object({ code: text, label: text.optional() }),
      description: "可读源码，不执行任意代码",
    },
    Metric: {
      props: z.object({ value: text, label: text, detail: text.optional() }),
      description: "指标",
    },
    Callout: {
      props: z.object({ title: text, text }),
      description: "规范提示",
    },
    Steps: {
      props: z.object({
        items: z.array(z.object({ title: text, description: text })),
      }),
      description: "步骤",
    },
    CapacityPlanner: {
      props: z.object({ initial: z.number().min(1).max(100) }),
      description:
        "白名单内的特殊交互组件，用 slot 嵌入；不允许 JSON 注入组件代码",
    },
  },
  actions: {},
});
