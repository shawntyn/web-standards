import type { Spec } from "@json-render/core";
import { SpecView } from "@repo/render";
import { preparePreviewSpec } from "../lib/preview-spec";

/** A server-side docs adapter. Never instantiate a demo UI component directly. */
export function ComponentPreview({ spec }: { spec: Spec }) {
  const validated = preparePreviewSpec(spec);
  return (
    <section aria-label="JSON 组件示例" className="my-8 space-y-4">
      <div className="rounded-2xl border border-ink/15 bg-white p-6">
        <SpecView spec={validated} />
      </div>
      <details className="rounded-2xl border border-ink/15 p-5">
        <summary className="cursor-pointer font-medium">
          查看此示例实际使用的 JSON spec
        </summary>
        <pre className="mt-4 overflow-x-auto text-xs leading-6">
          <code>{JSON.stringify(validated, null, 2)}</code>
        </pre>
      </details>
    </section>
  );
}
