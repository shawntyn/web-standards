import { contentToSpec } from "@repo/render/content";
import { QueryResultSchema } from "./query-schema";
import { validateSpec } from "../validate-spec";
import display from "./display.json";

export function analyticsToSpec(raw: unknown) {
  const data = QueryResultSchema.parse(raw);
  const spec = contentToSpec(display);
  const table = spec.elements["channels-table"];
  if (table?.type !== "ContentTable") throw new Error("展示配置缺少渠道表格");

  // 查询字段 → 表格单元格。标题、列名、布局和顺序仍由 display.json 声明。
  table.props.rows = data.channels.map((row) => [
    row.channel_name,
    String(row.order_count),
  ]);
  return validateSpec(spec);
}
