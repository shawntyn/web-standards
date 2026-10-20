import React from "react";
import { useEffect, useRef, useId, type ReactNode } from "react";
import { Button, Input } from "@repo/ui";
import { useWorkbench } from "./context";
export function ProjectEditor({
  editing,
  busy,
  simulateError,
  children,
}: {
  editing: boolean;
  busy: boolean;
  simulateError: boolean;
  children?: ReactNode;
}) {
  const actions = useWorkbench();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [editing]);
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id={`${id}-heading`}
        tabIndex={-1}
        ref={heading}
        className="mb-2 text-xl font-semibold outline-none"
      >
        {editing ? "编辑项目" : "新建项目"}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        保存会向 Route Handler
        发送真实请求并进行服务端校验；响应只保存到当前标签页的会话数据。
      </p>
      <form
        noValidate
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          void actions.submit();
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">{children}</div>
        <label
          htmlFor={`${id}-simulate`}
          className="my-5 flex items-center gap-2 text-sm text-slate-600"
        >
          <Input
            id={`${id}-simulate`}
            type="checkbox"
            className="h-4 w-4"
            checked={simulateError}
            disabled={busy}
            onChange={(event) => actions.simulate(event.target.checked)}
          />
          模拟服务端失败（503），用于演示错误恢复
        </label>
        <div className="flex gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? "正在保存…" : "保存项目"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={actions.cancel}
            disabled={busy}
          >
            取消
          </Button>
        </div>
      </form>
    </section>
  );
}
