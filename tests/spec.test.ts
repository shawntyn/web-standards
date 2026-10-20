import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { SpecView, ProjectSpecViewRender } from "../packages/render/src/index";
import { projectContentSpec } from "../packages/render/src/projects/project-content-spec";
import { ProjectSchema } from "../packages/domain/src/index";
import {
  homeSpec,
  standardsSpec,
  projectSpec,
  projects,
  getProject,
  projectCardsToElements,
  validateSpec,
} from "../packages/data/src/index";

test("all page examples are valid catalog specs with resolved references", () => {
  for (const spec of [
    homeSpec(),
    standardsSpec(),
    ...projects.map(projectSpec),
  ])
    assert.equal(validateSpec(spec), spec);
});
test("domain .map creates stable card IDs and named slots", () => {
  const elements = projectCardsToElements(projects);
  for (const project of projects) {
    assert.equal(
      elements["project-" + project.slug]?.props.title,
      project.name,
    );
    assert.deepEqual(elements["project-" + project.slug]?.slots?.footer, [
      "project-" + project.slug + "-link",
    ]);
  }
});
test("unknown routes return no domain resource", () => {
  assert.equal(getProject("missing"), undefined);
});
type SourceNode = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: SourceNode[];
  slots?: Record<string, SourceNode[]>;
};
function flatten(node: SourceNode): SourceNode[] {
  return [
    node,
    ...(node.children ?? []).flatMap(flatten),
    ...Object.values(node.slots ?? {}).flatMap((nodes) =>
      nodes.flatMap(flatten),
    ),
  ];
}
function fixture(content: unknown) {
  return ProjectSchema.parse({ ...projects[0]!, content });
}
test("real json-render SSR emits explicitly declared page structures and slots", () => {
  const [atlas, orbit, field] = projects.map((project) =>
    renderToString(createElement(SpecView, { spec: projectSpec(project) })),
  );
  assert.match(atlas, /Atlas 工作空间/);
  assert.match(atlas, /capacity-input/);
  assert.match(orbit, /<blockquote/);
  assert.match(orbit, /<pre/);
  assert.match(field, /<table/);
  for (const html of [orbit, field])
    assert.doesNotMatch(html, /capacity-input/);
  for (const html of [atlas, orbit, field]) {
    assert.doesNotMatch(html, /DOMAIN JSON|原始业务数据|这不是静态导出的页面/);
  }
});
test("project files are independent trees with genuinely different structures", () => {
  const folder = new URL("../packages/data/src/projects/", import.meta.url);
  assert.deepEqual(readdirSync(folder).sort(), [
    "atlas.json",
    "field.json",
    "orbit.json",
  ]);
  for (const project of projects) {
    const source = JSON.parse(
      readFileSync(new URL(`${project.slug}.json`, folder), "utf8"),
    );
    assert.deepEqual(ProjectSchema.parse(source), project);
  }
  assert.equal(
    new Set(
      projects.map((p) =>
        flatten(p.content)
          .map((n) => n.type)
          .join(","),
      ),
    ).size,
    3,
  );
  assert.equal(
    projects.filter((p) =>
      flatten(p.content).some((n) => n.type === "CapacityPlanner"),
    ).length,
    1,
  );
});
test("every source node maps exactly once, preserving props, child order and explicit slots", () => {
  for (const project of projects) {
    const spec = projectContentSpec(project);
    const source = flatten(project.content);
    assert.equal(spec.root, project.content.id);
    assert.equal(Object.keys(spec.elements).length, source.length);
    assert.deepEqual(
      Object.keys(spec.elements).sort(),
      source.map((n) => n.id).sort(),
    );
    for (const item of source) {
      const mapped = spec.elements[item.id]!;
      const heading = /^h([1-6])$/.exec(item.type);
      assert.equal(
        mapped.type,
        heading ? "Heading" : item.type === "p" ? "Text" : item.type,
      );
      assert.deepEqual(
        mapped.props,
        heading ? { ...item.props, level: Number(heading[1]) } : item.props,
      );
      assert.deepEqual(
        mapped.children ?? [],
        (item.children ?? []).map((n) => n.id),
      );
      assert.deepEqual(
        mapped.slots ?? {},
        Object.fromEntries(
          Object.entries(item.slots ?? {}).map(([key, nodes]) => [
            key,
            nodes.map((n) => n.id),
          ]),
        ),
      );
    }
    // The page adapter must not inject a frame or navigation into project data.
    assert.deepEqual(projectSpec(project), spec);
  }
});
test("h1 is explicit, metadata does not invent content, and a leaf needs no generated layout", () => {
  const project = fixture({
    id: "only",
    type: "h1",
    props: { text: "The authored title" },
  });
  const spec = projectContentSpec(project);
  const html = renderToString(
    createElement(ProjectSpecViewRender, { project }),
  );
  assert.match(html, /<h1[^>]*>The authored title<\/h1>/);
  assert.equal(Object.keys(spec.elements).length, 1);
  const metadataChanged = {
    ...project,
    name: "A different metadata name",
    description: "A metadata description that must not render.",
  };
  assert.deepEqual(projectContentSpec(metadataChanged), spec);
  const paragraphOnly = fixture({
    id: "only",
    type: "p",
    props: { text: "No heading requested" },
  });
  const paragraphHtml = renderToString(
    createElement(ProjectSpecViewRender, { project: paragraphOnly }),
  );
  assert.doesNotMatch(paragraphHtml, /<h1|<article|返回|Atlas/);
  assert.equal(
    Object.keys(projectContentSpec(paragraphOnly).elements).length,
    1,
  );
});
test("reorder, remove and add nodes without changing a route or template", () => {
  const project = fixture({
    id: "root",
    type: "Stack",
    props: { gap: "sm" },
    children: [
      { id: "second", type: "p", props: { text: "Second authored paragraph" } },
      { id: "first", type: "h2", props: { text: "First authored heading" } },
      { id: "new", type: "p", props: { text: "An additional paragraph" } },
    ],
  });
  const spec = projectContentSpec(project);
  assert.deepEqual(spec.elements.root.children, ["second", "first", "new"]);
  const html = renderToString(
    createElement(ProjectSpecViewRender, { project }),
  );
  assert.ok(
    html.indexOf("Second authored paragraph") <
      html.indexOf("First authored heading"),
  );
  assert.ok(
    html.indexOf("First authored heading") <
      html.indexOf("An additional paragraph"),
  );
  assert.doesNotMatch(html, /Atlas 工作空间|试算团队容量/);
});
test("schema rejects unknown types, hidden props, duplicate tree IDs and malformed table rows", () => {
  const valid = (content: unknown) =>
    ProjectSchema.safeParse({ ...projects[0], content }).success;
  assert.equal(
    valid({ id: "a", type: "unsafe-html", props: { html: "<script />" } }),
    false,
  );
  assert.equal(
    valid({ id: "a", type: "h1", props: { text: "Title", level: 3 } }),
    false,
  );
  assert.equal(
    valid({ id: "a", type: "p", props: { text: "Text", onClick: "execute" } }),
    false,
  );
  assert.equal(
    valid({
      id: "root",
      type: "Card",
      props: {},
      children: [{ id: "same", type: "p", props: { text: "one" } }],
      slots: { footer: [{ id: "same", type: "p", props: { text: "two" } }] },
    }),
    false,
  );
  assert.equal(
    valid({
      id: "a",
      type: "ContentTable",
      props: { caption: "data", columns: ["one"], rows: [["one", "two"]] },
    }),
    false,
  );
});
test("special slots contain only explicitly authored nodes and can be removed", () => {
  const project = fixture({
    id: "demo",
    type: "Card",
    props: {},
    children: [{ id: "body", type: "p", props: { text: "Card body" } }],
    slots: {
      footer: [
        { id: "planner", type: "CapacityPlanner", props: { initial: 4 } },
      ],
    },
  });
  const spec = projectContentSpec(project);
  assert.deepEqual(spec.elements.demo.slots?.footer, ["planner"]);
  assert.equal(Object.keys(spec.elements).length, 3);
  const withoutSlot = fixture({
    id: "demo",
    type: "Card",
    props: {},
    children: [{ id: "body", type: "p", props: { text: "Card body" } }],
  });
  const removed = projectContentSpec(withoutSlot);
  assert.equal(Object.keys(removed.elements).length, 2);
  assert.equal(removed.elements.planner, undefined);
  assert.equal(validateSpec(spec), spec);
});
test("invalid node references and unknown components are rejected", () => {
  assert.throws(() =>
    validateSpec({
      root: "a",
      elements: { a: { type: "Stack", props: {}, children: ["missing"] } },
    }),
  );
  assert.throws(() =>
    validateSpec({
      root: "a",
      elements: { a: { type: "DangerousCode", props: {}, children: [] } },
    }),
  );
});
