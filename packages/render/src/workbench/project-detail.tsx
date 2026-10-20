import React from "react";
import type { Project } from "@repo/domain";
import { Card, Badge } from "@repo/ui";
export function ProjectDetail(project: Project) {
  return (
    <Card
      title={`${project.name} · 会话详情`}
      description={project.description}
      header={<Badge text={project.status} />}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">标识 / 分类</dt>
          <dd>
            {project.slug} / {project.category}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">进度</dt>
          <dd>{project.progress}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">成员</dt>
          <dd>{project.members}</dd>
        </div>
        <div>
          <dt className="text-slate-500">任务</dt>
          <dd>{project.tasks}</dd>
        </div>
      </dl>
      <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
        {project.features.map((feature, index) => (
          <li key={`${index}-${feature}`}>{feature}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        这里从表格同一份会话 state 读取，保存后同步更新。独立 SSR
        /projects/[slug] 路由展示原始静态 JSON，不读取浏览器会话。
      </p>
    </Card>
  );
}
