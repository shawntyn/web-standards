import { before, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { SpecView } from "../packages/render/src/index";
import { contentToSpec } from "../packages/render/src/content-to-spec";
import {
  ContentSchema,
  ProjectSchema,
  type ContentNode,
  type Project,
} from "../packages/domain/src/index";
import {
  homeSpec,
  getProjects,
  getProject,
  validateSpec,
} from "../packages/data/src/index";

let projects: Project[];
let atlasProject: Project;
let orbitProject: Project;
before(async () => {
  projects = await getProjects(
    new URL("../packages/data/src/projects/", import.meta.url),
  );
  atlasProject = getProject("atlas", projects)!;
  orbitProject = getProject("orbit", projects)!;
});

function flatten(node: ContentNode): ContentNode[] {
  return [
    node,
    ...(node.children ?? []).flatMap(flatten),
    ...Object.values(node.slots ?? {}).flatMap((nodes) =>
      nodes.flatMap(flatten),
    ),
  ];
}
function render(content: ContentNode) {
  return renderToString(
    createElement(SpecView, { spec: validateSpec(contentToSpec(content)) }),
  );
}

test("首页与项目通过实际 catalog、registry 和官方 Renderer 输出 SSR 内容", () => {
  const home = renderToString(
    createElement(SpecView, { spec: validateSpec(homeSpec(projects)) }),
  );
  for (const { slug } of projects)
    assert.match(home, new RegExp(`href="/projects/${slug}"`));
  const links = [...home.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    [...new Set(links)].sort(),
    projects.map((project) => `/projects/${project.slug}`).sort(),
  );
  assert.doesNotMatch(home, /<nav\b|<main\b/);
  assert.match(home, /<h3[^>]*>Atlas 项目<\/h3>/);
  assert.match(home, /<h3[^>]*>Orbit 项目<\/h3>/);
  const atlas = render(atlasProject.content);
  const orbit = render(orbitProject.content);
  assert.match(atlas, /<h1[^>]*>Atlas 项目<\/h1>/);
  assert.match(atlas, /<h2[^>]*>本周安排<\/h2>/);
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
  const project = structuredClone(atlasProject);
  const root = project.content;
  root.children = root.children!.filter((node) => node.type !== "h1").reverse();
  const card = root.children[0];
  delete card.slots;
  root.children.push({ id: "added", type: "p", props: { text: "新增的一行" } });
  const content = ContentSchema.parse(root);
  const spec = contentToSpec(content);
  assert.deepEqual(spec.elements.atlas.children, [
    "atlas-plan",
    "atlas-intro",
    "added",
  ]);
  assert.equal(spec.elements["atlas-title"], undefined);
  assert.equal(spec.elements["atlas-next"], undefined);
  const html = render(content);
  assert.doesNotMatch(html, /<h1|<footer|阅读 Orbit/);
  assert.ok(html.indexOf("本周安排") < html.indexOf("一个小型团队"));
  assert.match(html, /新增的一行/);
});

test("正文外元数据不改变详情；叶节点不生成额外布局", () => {
  const original = atlasProject;
  const changed = ProjectSchema.parse({
    ...original,
    name: "另一个名字",
    description: "仅用于首页摘要",
  });
  assert.deepEqual(
    contentToSpec(changed.content),
    contentToSpec(original.content),
  );
  const leaf = ContentSchema.parse({
    id: "shell",
    type: "p",
    props: { text: "只有正文" },
  });
  assert.equal(contentToSpec(leaf).root, "shell");
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
    assert.equal(getProject(slug, [atlasProject, orbitProject]), undefined);
});

test("项目读取入口拒绝未知组件、非法 props、非法 slots、重复 ID 和错列表格", () => {
  for (const content of [
    { id: "a", type: "Script", props: {} },
    { id: "a", type: "h1", props: { text: "标题", level: 2 } },
    { id: "a", type: "p", props: { text: "正文", onClick: "execute" } },
    { id: "a", type: "p", props: { text: 123 } },
    { id: "a", type: "Stack", props: { gap: "huge" } },
    { id: "a", type: "Grid", props: { columns: 5 } },
    { id: "a", type: "Card", props: { title: "标题", titleLevel: 7 } },
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
      type: "Table",
      props: { caption: "表", columns: ["一列"], rows: [["一", "二"]] },
    },
  ])
    assert.equal(
      ProjectSchema.safeParse({ ...atlasProject, content }).success,
      false,
    );
});

test("Spec 校验拒绝缺失根、引用、循环、未知 slot、非法 props 和未使用节点", () => {
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
          type: "Stack",
          props: {},
          children: [],
          slots: { default: ["b"] },
        },
        b: { type: "Text", props: { text: "默认内容" }, children: [] },
      },
    },
    {
      root: "a",
      elements: {
        a: {
          type: "Card",
          props: {},
          children: [],
          slots: { default: ["b"] },
        },
        b: { type: "Text", props: { text: "默认内容" }, children: [] },
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
      elements: { a: { type: "Text", props: { text: 123 }, children: [] } },
    },
    {
      root: "a",
      elements: {
        a: { type: "Heading", props: { text: "标题", level: 7 }, children: [] },
      },
    },
    {
      root: "a",
      elements: {
        a: {
          type: "Table",
          props: { caption: "表", columns: ["一列"], rows: [["一", "二"]] },
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
});
