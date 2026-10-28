import commerce from "./fixtures/commerce.json";
import empty from "./fixtures/empty.json";
import { QueryResultSchema } from "./query-schema";

const datasets = { commerce, empty };
// 只读本地 JSON，不连接数据库，也没有客户端 fetch。
export function getAnalytics(slug: string) {
  if (!Object.hasOwn(datasets, slug)) return undefined;
  return QueryResultSchema.parse(datasets[slug as keyof typeof datasets]);
}
