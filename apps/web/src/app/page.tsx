import { connection } from "next/server";
import { SpecView } from "@repo/render";
import { homeSpec, pageSpec } from "@repo/data";

export default async function Page() {
  await connection();
  return <SpecView spec={pageSpec(homeSpec())} />;
}
