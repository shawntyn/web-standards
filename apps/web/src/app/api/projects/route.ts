import { projects } from "@repo/data";
export async function GET() {
  return Response.json({
    data: projects,
    meta: { source: "static-json-mock", count: projects.length },
  });
}
