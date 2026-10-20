import { connection } from "next/server";
import { SpecView } from "@repo/render";
import { homeSpec } from "@repo/data";
export default async function Page() {
  await connection();
  return <SpecView spec={homeSpec()} />;
}
