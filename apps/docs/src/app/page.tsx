import { connection } from "next/server";
import { SpecView } from "@repo/render";
import { docsHomeSpec } from "@repo/data";
export default async function Page() {
  await connection();
  return <SpecView spec={docsHomeSpec()} />;
}
