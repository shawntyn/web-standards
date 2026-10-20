import React from "react";
import type { Project } from "@repo/domain";
import { ProjectSpecViewRender } from "../projects/project-spec-view-render";
export function ProjectDetail(project: Project) {
  return (
    <section
      aria-label={`${project.name} · 会话详情`}
      className="border-t border-slate-200 pt-8"
    >
      <p className="mb-6 text-sm text-slate-500">
        会话详情：以下内容与表格共用当前标签页的数据，保存后同步更新。独立 SSR
        路由仍展示原始静态 JSON。
      </p>
      <ProjectSpecViewRender project={project} />
    </section>
  );
}
