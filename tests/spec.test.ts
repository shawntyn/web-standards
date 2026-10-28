import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { SpecView } from "../packages/render/src/index";
import { contentToSpec } from "../packages/render/src/content-to-spec";
import {
  ContentSchema,
  ProjectSchema,
  type ContentBlock,
} from "../packages/domain/src/index";
import {
  homeSpec,
  pageSpec,
  projects,
  getProject,
  validateSpec,
} from "../packages/data/src/index";

function flatten(node: ContentBlock): ContentBlock[] {
  return [
    node,
    ...(node.children ?? []).flatMap(flatten),
    ...Object.values(node.slots ?? {}).flatMap((nodes) =>
      nodes.flatMap(flatten),
    ),
  ];
}
function render(content: unknown) {
  return renderToString(
    createElement(SpecView, { spec: contentToSpec(content) }),
  );
}

test("首页与两个项目通过实际 catalog、registry 和官方 Renderer 输出 SSR 内容", () => {
  const home = renderToString(
    createElement(SpecView, { spec: pageSpec(homeSpec()) }),
  );
  for (const slug of ["atlas", "orbit"])
    assert.match(home, new RegExp(`href="/projects/${slug}"`));
  const links = [...home.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual([...new Set(links)].sort(), [
    "/",
    "/projects/atlas",
    "/projects/orbit",
  ]);
  const atlas = render(projects[0].content);
  const orbit = render(projects[1].content);
  assert.match(atlas, /<h1[^>]*>Atlas 项目<\/h1>/);
  assert.match(atlas, /<li>整理首页内容<\/li>/);
  assert.match(atlas, /<footer[^>]*><a[^>]*href="\/projects\/orbit"/);
  assert.match(orbit, /<caption[^>]*>阅读计划<\/caption>/);
  assert.match(orbit, /<td[^>]*>了解数据结构<\/td>/);
  assert.doesNotMatch(orbit, /本周安排/);
});

test("逐节点保持 ID、props、children 顺序和命名 slots，一节点只生成一个元素", () => {
  for (const project of projects) {
    const spec = validateSpec(contentToSpec(project.content));
    const source = flatten(project.content);
    assert.equal(spec.root, project.content.id);
    assert.deepEqual(
      Object.keys(spec.elements).sort(),
      source.map((node) => node.id).sort(),
    );
    for (const node of source) {
      const element = spec.elements[node.id];
      const heading = /^h([1-6])$/.exec(node.type);
      assert.equal(
        element.type,
        heading ? "Heading" : node.type === "p" ? "Text" : node.type,
      );
      assert.deepEqual(
        element.props,
        heading ? { ...node.props, level: Number(heading[1]) } : node.props,
      );
      assert.deepEqual(
        element.children,
        (node.children ?? []).map((child) => child.id),
      );
      assert.deepEqual(
        element.slots ?? {},
        Object.fromEntries(
          Object.entries(node.slots ?? {}).map(([name, children]) => [
            name,
            children.map((child) => child.id),
          ]),
        ),
      );
    }
  }
});

test("增删和重排 JSON 会改变输出；删除 h1 或 slot 不会补回", () => {
  const project = structuredClone(projects[0]);
  const root = project.content;
  root.children = root.children!.filter((node) => node.type !== "h1").reverse();
  const card = root.children[0];
  delete card.slots;
  root.children.push({ id: "added", type: "p", props: { text: "新增的一行" } });
  const spec = contentToSpec(root);
  assert.deepEqual(spec.elements.atlas.children, [
    "atlas-plan",
    "atlas-intro",
    "added",
  ]);
  assert.equal(spec.elements["atlas-title"], undefined);
  assert.equal(spec.elements["atlas-next"], undefined);
  const html = render(root);
  assert.doesNotMatch(html, /<h1|<footer|阅读 Orbit/);
  assert.ok(html.indexOf("本周安排") < html.indexOf("一个小型团队"));
  assert.match(html, /新增的一行/);
});

test("正文外元数据不改变详情；叶节点不生成额外布局", () => {
  const original = projects[0];
  const changed = ProjectSchema.parse({
    ...original,
    name: "另一个名字",
    description: "仅用于首页摘要",
  });
  assert.deepEqual(
    contentToSpec(changed.content),
    contentToSpec(original.content),
  );
  const leaf = { id: "only", type: "p", props: { text: "只有正文" } };
  assert.equal(Object.keys(contentToSpec(leaf).elements).length, 1);
  const html = render(leaf);
  assert.match(html, /<p[^>]*>只有正文<\/p>/);
  assert.doesNotMatch(html, /<h1|<main|<nav/);
});

test("未知项目和危险参数不会读取任意文件", () => {
  for (const slug of [
    "missing",
    "ATLAS",
    "__proto__",
    "constructor",
    "../atlas",
    "atlas/extra",
    "",
  ])
    assert.equal(getProject(slug), undefined);
});

test("内容 schema 拒绝未知组件、额外 props、非法 slots、重复 ID 和错列表格", () => {
  for (const content of [
    { id: "a", type: "Script", props: {} },
    { id: "a", type: "h1", props: { text: "标题", level: 2 } },
    { id: "a", type: "p", props: { text: "正文", onClick: "execute" } },
    { id: "a", type: "p", props: { text: "正文" }, children: [] },
    { id: "a", type: "Card", props: {}, slots: { secret: [] } },
    {
      id: "a",
      type: "Card",
      props: {},
      children: [{ id: "same", type: "p", props: { text: "一" } }],
      slots: { footer: [{ id: "same", type: "p", props: { text: "二" } }] },
    },
    {
      id: "a",
      type: "ContentTable",
      props: { caption: "表", columns: ["一列"], rows: [["一", "二"]] },
    },
  ])
    assert.equal(ContentSchema.safeParse(content).success, false);
});

test("Spec 校验拒绝缺失根、引用、循环、未知 slot、未知 props 和未使用节点", () => {
  const invalidSpecs: ReturnType<typeof contentToSpec>[] = [
    { root: "missing", elements: {} },
    {
      root: "a",
      elements: { a: { type: "Stack", props: {}, children: ["missing"] } },
    },
    {
      root: "a",
      elements: { a: { type: "Stack", props: {}, children: ["a"] } },
    },
    {
      root: "a",
      elements: {
        a: { type: "Card", props: {}, children: [], slots: { secret: [] } },
      },
    },
    {
      root: "a",
      elements: {
        a: {
          type: "Text",
          props: { text: "文字", html: "<b />" },
          children: [],
        },
      },
    },
    {
      root: "a",
      elements: { a: { type: "Unknown", props: {}, children: [] } },
    },
    {
      root: "a",
      elements: {
        a: { type: "Text", props: { text: "文字" }, children: ["b"] },
        b: { type: "Text", props: { text: "子项" }, children: [] },
      },
    },
    {
      root: "a",
      elements: {
        a: { type: "Stack", props: {}, children: [] },
        b: { type: "Text", props: { text: "孤立节点" }, children: [] },
      },
    },
  ];
  for (const spec of invalidSpecs) assert.throws(() => validateSpec(spec));
  assert.throws(() =>
    pageSpec({
      root: "site-frame",
      elements: { "site-frame": { type: "Stack", props: {} } },
    }),
  );
});
