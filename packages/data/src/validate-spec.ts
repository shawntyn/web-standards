import type { Spec } from "@json-render/core";
import { catalog } from "@repo/render/catalog";

export function validateSpec(spec: Spec): Spec {
  const result = catalog.validate(spec);
  if (!result.success) throw result.error;
  if (!spec.elements[spec.root]) throw new Error("缺少根节点");

  for (const [id, element] of Object.entries(spec.elements)) {
    const definition =
      catalog.data.components[
        element.type as keyof typeof catalog.data.components
      ];
    if (!definition) throw new Error(`未知组件：${element.type}`);
    // catalog.validate() 检查 Spec 结构；属性仍需按组件的严格 schema 校验。
    definition.props.parse(element.props);
    const allowedSlots: readonly string[] =
      "slots" in definition ? definition.slots : [];
    if (element.children?.length && !allowedSlots.includes("default"))
      throw new Error(`组件不接收 children：${id}`);
    for (const name of Object.keys(element.slots ?? {})) {
      if (name === "default")
        throw new Error(`默认内容必须使用 children：${id}`);
      if (!allowedSlots.includes(name))
        throw new Error(`未知 slot：${id}.${name}`);
    }
  }

  const visited = new Set<string>();
  const active = new Set<string>();
  function visit(id: string) {
    const element = spec.elements[id];
    if (!element) throw new Error(`缺少引用：${id}`);
    if (active.has(id)) throw new Error(`循环引用：${id}`);
    if (visited.has(id)) return;
    active.add(id);
    for (const ref of [
      ...(element.children ?? []),
      ...Object.values(element.slots ?? {}).flat(),
    ])
      visit(ref);
    active.delete(id);
    visited.add(id);
  }
  visit(spec.root);
  if (visited.size !== Object.keys(spec.elements).length)
    throw new Error("存在未使用的节点");
  return spec;
}
