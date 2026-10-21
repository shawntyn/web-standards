import { z } from "zod";
import { ContentSchema, type ContentBlock } from "@repo/domain";
import { projectContentSpec } from "@repo/render/projects";
import { QueryResultSchema } from "./query-schema";
import { validateSpec } from "../validate-spec";
import display from "./display.json";
const DisplaySchema = z
  .object({
    content: ContentSchema,
    bindings: z.array(
      z
        .object({
          nodeId: z.string(),
          kind: z.enum(["daily", "channels", "statuses", "goals", "table"]),
          query: z.enum(["daily", "channels", "statuses", "goals"]),
        })
        .strict(),
    ),
    inspectors: z
      .object({ query: z.string(), config: z.string(), spec: z.string() })
      .strict(),
  })
  .strict();
export const analyticsDisplay = DisplaySchema.parse(display);
/** The display tree owns every label, component, order and slot. Bindings only adapt rows to props. */
export function analyticsToSpec(
  raw: unknown,
  rawDisplay: unknown = analyticsDisplay,
) {
  const rows = QueryResultSchema.parse(raw);
  const config = DisplaySchema.parse(rawDisplay);
  const ids = Object.values(config.inspectors);
  if (
    new Set(ids).size !== ids.length ||
    config.bindings.some((b) => ids.includes(b.nodeId))
  )
    throw new Error("Inspector IDs must be distinct and unbound");
  const originalContent = structuredClone(config.content);
  const nodes = new Map<string, ContentBlock>();
  function collect(n: ContentBlock) {
    nodes.set(n.id, n);
    n.children?.forEach(collect);
    Object.values(n.slots ?? {})
      .flat()
      .forEach(collect);
  }
  collect(config.content);
  const used = new Set<string>();
  for (const binding of config.bindings) {
    if (used.has(binding.nodeId)) throw new Error("Duplicate binding");
    used.add(binding.nodeId);
    const target = nodes.get(binding.nodeId);
    if (!target) throw new Error("Missing binding target");
    const expected = binding.kind === "table" ? "channels" : binding.kind;
    if (binding.query !== expected) throw new Error("Query binding mismatch");
    if (binding.kind === "goals") {
      if (target.type !== "ProgressList")
        throw new Error("Progress binding target mismatch");
      target.props.items = rows.goals.map((row) => ({
        label: row.team_name,
        value: row.completed_count,
        max: row.target_count,
      }));
    } else if (binding.kind === "table") {
      if (target.type !== "ContentTable")
        throw new Error("Table binding target mismatch");
      target.props.rows = rows.channels.map((row) => [
        row.channel_name,
        String(row.order_count),
      ]);
    } else {
      if (!["LineChart", "BarChart", "DistributionChart"].includes(target.type))
        throw new Error("Chart binding target mismatch");
      const points =
        binding.kind === "daily"
          ? rows.daily.map((row) => ({
              label: row.day,
              value: row.order_count,
            }))
          : binding.kind === "channels"
            ? rows.channels.map((row) => ({
                label: row.channel_name,
                value: row.order_count,
              }))
            : rows.statuses.map((row) => ({
                label: row.status_name,
                value: row.order_count,
              }));
      Object.assign(target.props, { points });
    }
  }
  // Inspection nodes are explicitly authored, not invented by the mapper. Exclude them from snapshots to prevent recursive output.
  const inspectorIds = Object.values(config.inspectors);
  function strip(n: ContentBlock): ContentBlock {
    return {
      ...n,
      ...(n.children
        ? {
            children: n.children
              .filter((c) => !inspectorIds.includes(c.id))
              .map(strip),
          }
        : {}),
      ...(n.slots
        ? {
            slots: Object.fromEntries(
              Object.entries(n.slots).map(([k, v]) => [
                k,
                v.filter((c) => !inspectorIds.includes(c.id)).map(strip),
              ]),
            ),
          }
        : {}),
    };
  }
  const contentSpec = validateSpec(
    projectContentSpec({ content: strip(config.content) }),
  );
  const code = [
    JSON.stringify(rows, null, 2),
    JSON.stringify({ ...config, content: strip(originalContent) }, null, 2),
    JSON.stringify(contentSpec, null, 2),
  ];
  inspectorIds.forEach((id, i) => {
    const n = nodes.get(id);
    if (n?.type !== "Code") throw new Error("Inspector target must be Code");
    n.props.code = code[i]!;
  });
  return validateSpec(projectContentSpec({ content: config.content }));
}
