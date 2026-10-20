import { fields } from "./project-fields";
import type { Spec } from "@json-render/core";
import type { Project, ProjectDraft } from "@repo/domain";
export type WorkbenchView = {
  records: Project[];
  query: string;
  status: string;
  busy: boolean;
  ready: boolean;
  draft: ProjectDraft | null;
  originalSlug: string | null;
  errors: Record<string, string>;
  message: string;
  failure: boolean;
  simulateError: boolean;
  selectedSlug: string | null;
};
export function workbenchToSpec(view: WorkbenchView): Spec {
  const matching = view.records.filter(
    (project) =>
      (!view.status || project.status === view.status) &&
      `${project.name} ${project.slug} ${project.category}`
        .toLowerCase()
        .includes(view.query.trim().toLowerCase()),
  );
  const rowIds = matching.map((project) => `row-${project.slug}`);
  const elements: Spec["elements"] = {
    layout: {
      type: "WorkbenchLayout",
      props: {},
      children: [
        "notice",
        "toolbar",
        ...(view.message ? ["feedback"] : []),
        ...(view.draft ? ["editor"] : []),
        "table",
        ...(view.selectedSlug &&
        view.records.some((project) => project.slug === view.selectedSlug)
          ? ["detail"]
          : []),
      ],
    },
    notice: {
      type: "WorkbenchNotice",
      props: {
        title: "可操作的 Mock 流程，不是持久数据库",
        text: "SSR 首屏来自静态 JSON。新建 / 编辑通过真实 HTTP 校验，保存到当前标签页 sessionStorage；刷新可保留，关闭标签页后结束，不与其他用户同步。独立 SSR 项目详情始终展示原始 JSON，请用表格的「详情」查看会话修改。",
      },
    },
    toolbar: {
      type: "ProjectToolbar",
      props: {
        query: view.query,
        status: view.status,
        busy: view.busy,
        ready: view.ready,
      },
    },
    table: {
      type: "ProjectTable",
      props: { count: matching.length },
      children: rowIds,
    },
    // Domain rows become stable protocol nodes; no hand-built business page JSX.
    ...Object.fromEntries(
      matching.map((project) => [
        `row-${project.slug}`,
        {
          type: "ProjectRow",
          props: { ...project, busy: view.busy || !view.ready },
        },
      ]),
    ),
  };
  if (view.message)
    elements.feedback = {
      type: "ProjectFeedback",
      props: { message: view.message, error: view.failure },
    };
  if (view.draft) {
    const draft = view.draft;
    elements.editor = {
      type: "ProjectEditor",
      props: {
        editing: view.originalSlug !== null,
        busy: view.busy,
        simulateError: view.simulateError,
      },
      children: fields.map((field) => `field-${field.name}`),
    };
    Object.assign(
      elements,
      Object.fromEntries(
        fields.map((field) => [
          `field-${field.name}`,
          {
            type: "ProjectField",
            props: {
              ...field,
              value: draft[field.name],
              error: view.errors[field.name],
              disabled:
                view.busy ||
                (field.name === "slug" && view.originalSlug !== null),
              required: field.name !== "features",
            },
          },
        ]),
      ),
    );
  }
  const selected = view.records.find(
    (project) => project.slug === view.selectedSlug,
  );
  if (selected)
    elements.detail = { type: "ProjectDetail", props: { ...selected } };
  return {
    root: "layout",
    elements: Object.fromEntries(
      Object.entries(elements).map(([id, element]) => [
        id,
        {
          ...element,
          children: element.children ?? [],
          props: Object.fromEntries(
            Object.entries(element.props).filter(
              ([, value]) => value !== undefined,
            ),
          ),
        },
      ]),
    ),
  };
}
