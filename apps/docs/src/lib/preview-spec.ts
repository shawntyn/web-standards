import type { Spec } from "@json-render/core";
import { validateSpec } from "@repo/data";
/** Local MDX examples may omit empty children; the catalog requires explicit arrays. */
export function preparePreviewSpec(spec: Spec): Spec {
  return validateSpec({
    ...spec,
    elements: Object.fromEntries(
      Object.entries(spec.elements).map(([id, element]) => [
        id,
        { ...element, children: element.children ?? [] },
      ]),
    ),
  });
}
