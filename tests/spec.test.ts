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
test("real json-render SSR emits document content and only the relevant special slot", () => {
  const [atlas, orbit, field] = projects.map((project) =>
    renderToString(createElement(SpecView, { spec: projectSpec(project) })),
  );
  assert.match(atlas, /Atlas 工作空间/);
  assert.match(atlas, /capacity-input/);
  assert.match(atlas, /试算团队容量/);
  assert.match(orbit, /<blockquote>/);
  assert.match(orbit, /<pre/);
  assert.match(field, /<table/);
  assert.match(field, /首周激活漏斗/);
  for (const html of [orbit, field])
    assert.doesNotMatch(html, /capacity-input/);
  for (const html of [atlas, orbit, field]) {
    assert.match(html, /<article/);
    assert.doesNotMatch(
      html,
      /DOMAIN JSON|原始业务数据|这不是静态导出的页面|项目进度|已处理任务/,
    );
  }
});
test("project files are independent documents with genuinely different ordered structures", () => {
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
    new Set(projects.map((p) => p.content.map((b) => b.type).join(","))).size,
    3,
  );
  assert.equal(
    projects.filter((p) => p.content.some((b) => b.type === "capacity-plan"))
      .length,
    1,
  );
});
test("reorder, remove and add content without changing a route or template", () => {
  const project = {
    ...projects[1]!,
    content: [
      {
        id: "second",
        type: "paragraph" as const,
        text: "Second authored paragraph",
      },
      {
        id: "first",
        type: "heading" as const,
        level: 2 as const,
        text: "First authored heading",
      },
      {
        id: "new",
        type: "paragraph" as const,
        text: "An additional paragraph",
      },
    ],
  };
  const spec = projectContentSpec(project);
  assert.deepEqual(spec.elements.document.children, [
    "document-title",
    "document-description",
    "content:second",
    "content:first",
    "content:new",
  ]);
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
  assert.doesNotMatch(html, /一个可以带走的格式/);
});
test("content validation rejects unknown blocks, duplicate IDs and malformed table rows", () => {
  const invalid = (content: unknown) =>
    ProjectSchema.safeParse({ ...projects[0], content }).success;
  assert.equal(
    invalid([{ id: "a", type: "unsafe-html", html: "<script />" }]),
    false,
  );
  assert.equal(
    invalid([
      { id: "a", type: "paragraph", text: "one" },
      { id: "a", type: "paragraph", text: "two" },
    ]),
    false,
  );
  assert.equal(
    invalid([
      {
        id: "a",
        type: "table",
        caption: "data",
        columns: ["one"],
        rows: [["one", "two"]],
      },
    ]),
    false,
  );
});
test("special slot IDs cannot collide with authored content IDs", () => {
  const spec = projectContentSpec({
    ...projects[0]!,
    content: [
      {
        id: "demo",
        type: "capacity-plan",
        title: "Demo",
        description: "Trial",
        initial: 4,
      },
      {
        id: "demo-planner",
        type: "paragraph",
        text: "This is a separate authored block",
      },
    ],
  });
  assert.equal(spec.elements["slot:demo:planner"].type, "CapacityPlanner");
  assert.equal(spec.elements["content:demo-planner"].type, "Text");
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
