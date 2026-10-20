import type { Spec } from "@json-render/core";
import { catalog } from "@repo/render/catalog";
export function validateSpec(spec: Spec): Spec {
  const result = catalog.validate(spec);
  if (!result.success) throw result.error;
  if (!spec.elements[spec.root]) throw new Error("Missing root");
  for (const [id, n] of Object.entries(spec.elements)) {
    const definition =
      catalog.data.components[n.type as keyof typeof catalog.data.components];
    if (!definition) throw new Error(`Unknown component ${n.type}`);
    definition.props.parse(n.props);
    for (const ref of [
      ...(n.children ?? []),
      ...Object.values(n.slots ?? {}).flat(),
    ])
      if (!spec.elements[ref])
        throw new Error(`Missing reference ${id} -> ${ref}`);
  }
  return spec;
}
