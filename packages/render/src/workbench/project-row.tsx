import React from "react";
import { Badge, Button } from "@repo/ui";
import type { Project } from "@repo/domain";
import { useWorkbench } from "./context";
export function ProjectRow({ busy, ...project }: Project & { busy: boolean }) {
  const actions = useWorkbench();
  return (
    <tr className="border-t border-slate-200 align-top">
      <th scope="row" className="px-4 py-4 text-left font-medium">
        <span className="block">{project.name}</span>
        <span className="text-xs font-normal text-slate-500">
          {project.slug} · {project.category}
        </span>
      </th>
      <td className="px-4 py-4">
        <Badge
          text={project.status}
          tone={project.status === "运行中" ? "success" : "neutral"}
        />
      </td>
      <td className="px-4 py-4 tabular-nums">{project.progress}%</td>
      <td className="px-4 py-4 tabular-nums">
        {project.members} 人 / {project.tasks} 项
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => actions.inspect(project.slug)}
            aria-label={`查看 ${project.name}`}
          >
            详情
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => actions.edit(project.slug)}
            aria-label={`编辑 ${project.name}`}
          >
            编辑
          </Button>
        </div>
      </td>
    </tr>
  );
}
