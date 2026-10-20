import { MutationSchema } from "./project-schema";
export async function handleMockMutation(
  request: Request,
  slug?: string,
): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "请求必须为有效 JSON" }, { status: 400 });
  }
  const result = MutationSchema.safeParse(json);
  if (!result.success)
    return Response.json(
      { error: "数据校验失败", issues: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  if (slug !== undefined && result.data.project.slug !== slug)
    return Response.json({ error: "编辑时不能更改项目标识" }, { status: 409 });
  if (result.data.simulateError)
    return Response.json(
      { error: "模拟服务端错误：数据未保存，可取消模拟后重试" },
      { status: 503 },
    );
  return Response.json(
    {
      data: result.data.project,
      meta: { persistence: "client-session-only", serverStored: false },
    },
    {
      status: slug === undefined ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
