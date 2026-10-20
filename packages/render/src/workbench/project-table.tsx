import React from "react";
import type { ReactNode } from "react";
import { Table } from "@repo/ui";
export function ProjectTable({
  count,
  children,
}: {
  count: number;
  children?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table caption={`项目列表，共 ${count} 项`}>
        <thead>
          <tr>
            {["项目 / 分类", "状态", "进度", "成员 / 任务", "操作"].map(
              (label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-600"
                >
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {count ? (
            children
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                没有匹配的项目。调整筛选条件，或新建一个项目。
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
