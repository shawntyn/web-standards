import type { Spec } from "@json-render/core";
export type Node = Spec["elements"][string];
export function node(
  type: string,
  props: Record<string, unknown> = {},
  children: string[] = [],
  slots?: Record<string, string[]>,
): Node {
  return { type, props, children, ...(slots ? { slots } : {}) };
}
