import commerce from "./fixtures/commerce.json";
import empty from "./fixtures/empty.json";
import zero from "./fixtures/zero.json";
import { QueryResultSchema } from "./query-schema";
const fixtures = { commerce, empty, zero };
/** Mock DB driver result. No SQL is executed; fixtures are query-shaped rows, not UI specs. */
export async function queryAnalytics(slug: string) {
  if (!Object.hasOwn(fixtures, slug)) return undefined;
  return QueryResultSchema.parse(fixtures[slug as keyof typeof fixtures]);
}
