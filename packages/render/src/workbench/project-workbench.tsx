"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import {
  ProjectListSchema,
  ProjectSchema,
  STORAGE_KEY,
  emptyDraft,
  parseDraft,
  saveProject,
  toDraft,
  type Project,
} from "@repo/domain";
import { WorkbenchContext, type WorkbenchActions } from "./context";
import { workbenchToSpec, type WorkbenchView } from "./mapping";
import { workbenchRegistry } from "./registry";
export function ProjectWorkbench({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [view, setView] = useState<WorkbenchView>({
    records: initialProjects,
    query: "",
    status: "",
    busy: false,
    ready: false,
    draft: null,
    originalSlug: null,
    errors: {},
    message: "",
    failure: false,
    simulateError: false,
    selectedSlug: null,
  });
  const locked = useRef(false);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let records = initialProjects;
    let message = "";
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = ProjectListSchema.safeParse(JSON.parse(saved));
        if (
          parsed.success &&
          new Set(parsed.data.map((project) => project.slug)).size ===
            parsed.data.length
        )
          records = parsed.data;
        else message = "已忽略无效的会话数据，使用初始 JSON。";
      }
    } catch {
      message = "浏览器会话存储不可用；更改仅保留到本页刷新前。";
    }
    setView((current) => ({
      ...current,
      records,
      ready: true,
      message,
      failure: Boolean(message),
    }));
  }, [initialProjects]);
  function persist(records: Project[]) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return "";
    } catch {
      return "（会话存储不可用，刷新后会丢失本次更改）";
    }
  }
  const actions: WorkbenchActions = {
    startNew() {
      setView((current) => ({
        ...current,
        draft: { ...emptyDraft },
        originalSlug: null,
        errors: {},
        message: "",
        failure: false,
        simulateError: false,
      }));
    },
    edit(slug) {
      const project = view.records.find((item) => item.slug === slug);
      if (project)
        setView((current) => ({
          ...current,
          draft: toDraft(project),
          originalSlug: slug,
          selectedSlug: slug,
          errors: {},
          message: "",
          failure: false,
          simulateError: false,
        }));
    },
    inspect(slug) {
      setView((current) => ({ ...current, selectedSlug: slug }));
    },
    cancel() {
      setView((current) => ({
        ...current,
        draft: null,
        errors: {},
        message: "已取消，未保存的修改已丢弃。",
        failure: false,
        simulateError: false,
      }));
    },
    reset() {
      if (
        !window.confirm("恢复初始 JSON？当前标签页新建和编辑的数据将被替换。")
      )
        return;
      const warning = persist(initialProjects);
      setView((current) => ({
        ...current,
        records: initialProjects,
        draft: null,
        selectedSlug: null,
        errors: {},
        query: "",
        status: "",
        message: `已恢复初始数据。${warning}`,
        failure: Boolean(warning),
      }));
    },
    change(name, value) {
      setView((current) => ({
        ...current,
        draft: current.draft ? { ...current.draft, [name]: value } : null,
        errors: { ...current.errors, [name]: "" },
      }));
    },
    search(query) {
      setView((current) => ({ ...current, query }));
    },
    filter(status) {
      setView((current) => ({ ...current, status }));
    },
    simulate(simulateError) {
      setView((current) => ({ ...current, simulateError }));
    },
    async submit() {
      if (!view.draft || locked.current) return;
      const parsed = parseDraft(view.draft);
      if (!parsed.success) {
        const errors = Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
        setView((current) => ({
          ...current,
          errors,
          message: "请修正标记的字段后再保存。",
          failure: true,
        }));
        requestAnimationFrame(() =>
          container.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus(),
        );
        return;
      }
      try {
        saveProject(view.records, parsed.data, view.originalSlug);
      } catch (error) {
        setView((current) => ({
          ...current,
          errors: { slug: error instanceof Error ? error.message : "标识冲突" },
          message: "无法保存，请检查项目标识。",
          failure: true,
        }));
        return;
      }
      locked.current = true;
      setView((current) => ({
        ...current,
        busy: true,
        errors: {},
        message: "正在提交并等待服务端校验…",
        failure: false,
      }));
      try {
        const response = await fetch(
          view.originalSlug
            ? `/api/projects/${encodeURIComponent(view.originalSlug)}`
            : "/api/projects",
          {
            method: view.originalSlug ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project: parsed.data,
              simulateError: view.simulateError,
            }),
          },
        );
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            typeof payload.error === "string"
              ? payload.error
              : `请求失败（${response.status}）`,
          );
        const saved = ProjectSchema.parse(payload.data);
        const records = saveProject(view.records, saved, view.originalSlug);
        const warning = persist(records);
        setView((current) => ({
          ...current,
          records,
          draft: null,
          busy: false,
          selectedSlug: saved.slug,
          query: "",
          status: "",
          message: `${view.originalSlug ? "已更新" : "已创建"}「${saved.name}」。表格与会话详情已同步。${warning}`,
          failure: Boolean(warning),
          simulateError: false,
        }));
      } catch (error) {
        setView((current) => ({
          ...current,
          busy: false,
          message:
            error instanceof Error ? error.message : "网络错误，请重试。",
          failure: true,
        }));
      } finally {
        locked.current = false;
      }
    },
  };
  return (
    <WorkbenchContext.Provider value={actions}>
      <div ref={container} className="space-y-6">
        <JSONUIProvider registry={workbenchRegistry}>
          <Renderer spec={workbenchToSpec(view)} registry={workbenchRegistry} />
        </JSONUIProvider>
      </div>
    </WorkbenchContext.Provider>
  );
}
