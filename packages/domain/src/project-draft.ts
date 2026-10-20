import { z } from "zod";
import { ProjectSchema, type Project } from "./project-schema";
export type ProjectDraft = Record<keyof Project, string>;
export const emptyDraft: ProjectDraft = {
  slug: "",
  name: "",
  category: "产品应用",
  description: "",
  status: "构建中",
  progress: "0",
  members: "1",
  tasks: "0",
  features: "",
  content: JSON.stringify(
    [{ id: "introduction", type: "paragraph", text: "在这里填写项目正文。" }],
    null,
    2,
  ),
};
export function toDraft(project: Project): ProjectDraft {
  return {
    ...project,
    progress: String(project.progress),
    members: String(project.members),
    tasks: String(project.tasks),
    features: project.features.join("\n"),
    content: JSON.stringify(project.content, null, 2),
  };
}
const JsonContentSchema = z.string().transform((value, context): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    context.addIssue({
      code: "custom",
      message: "正文必须为有效 JSON 数组，请检查引号与逗号",
    });
    return z.NEVER;
  }
});
export function parseDraft(draft: ProjectDraft) {
  const numeric = (value: string) =>
    value.trim() === "" ? NaN : Number(value);
  return ProjectSchema.extend({
    content: JsonContentSchema.pipe(ProjectSchema.shape.content),
  }).safeParse({
    ...draft,
    progress: numeric(draft.progress),
    members: numeric(draft.members),
    tasks: numeric(draft.tasks),
    features: draft.features
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
  });
}
