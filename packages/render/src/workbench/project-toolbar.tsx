import React from "react";
import { useId } from "react";
import { Button, Input, Select, FormField } from "@repo/ui";
import { useWorkbench } from "./context";
export function ProjectToolbar({
  query,
  status,
  busy,
  ready,
}: {
  query: string;
  status: string;
  busy: boolean;
  ready: boolean;
}) {
  const actions = useWorkbench();
  const id = useId();
  return (
    <section
      aria-label="项目筛选与操作"
      className="flex flex-wrap items-end gap-4"
    >
      <FormField htmlFor={`${id}-search`} label="搜索项目">
        <Input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(event) => actions.search(event.target.value)}
          placeholder="名称、标识或分类"
        />
      </FormField>
      <FormField htmlFor={`${id}-filter`} label="项目状态">
        <Select
          id={`${id}-filter`}
          value={status}
          onChange={(event) => actions.filter(event.target.value)}
        >
          <option value="">全部状态</option>
          {["运行中", "构建中", "已归档"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
      </FormField>
      <Button onClick={actions.startNew} disabled={busy || !ready}>
        新建项目
      </Button>
      <Button
        variant="secondary"
        onClick={actions.reset}
        disabled={busy || !ready}
      >
        恢复初始数据
      </Button>
    </section>
  );
}
