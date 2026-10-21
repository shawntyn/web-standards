import { analyticsToSpec } from "../analytics/mapping";
import { shell } from "../page-shell";
export function analyticsSpec(rows: unknown) {
  const spec = analyticsToSpec(rows);
  return shell(spec.elements, [spec.root]);
}
