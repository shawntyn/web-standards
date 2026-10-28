import { SpecView } from "@repo/render";
import { pageSpec } from "@repo/data";
export default function NotFound() {
  return (
    <SpecView
      spec={pageSpec({
        root: "not-found",
        elements: {
          "not-found": {
            type: "Stack",
            props: {},
            children: ["not-found-title", "not-found-text"],
          },
          "not-found-title": {
            type: "Heading",
            props: { text: "404 · 没有找到内容", level: 1 },
            children: [],
          },
          "not-found-text": {
            type: "Text",
            props: { text: "请通过首页选择 Atlas 或 Orbit 项目。" },
            children: [],
          },
        },
      })}
    />
  );
}
