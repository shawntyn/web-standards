import { SpecView } from "@repo/render";
export default function NotFound() {
  return (
    <SpecView
      spec={{
        root: "root",
        elements: {
          root: {
            type: "Stack",
            props: { gap: "lg" },
            children: ["heading", "text", "back"],
          },
          heading: {
            type: "Heading",
            props: { text: "404 · 这里还没有内容", level: 1 },
            children: [],
          },
          text: {
            type: "Text",
            props: { text: "请求的资源不存在，请从目录选择有效示例。" },
            children: [],
          },
          back: {
            type: "LinkButton",
            props: { label: "返回首页", href: "/" },
            children: [],
          },
        },
      }}
    />
  );
}
