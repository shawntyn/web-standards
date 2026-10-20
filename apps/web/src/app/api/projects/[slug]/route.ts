import { handleMockMutation } from "@repo/domain";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  return handleMockMutation(request, slug);
}
