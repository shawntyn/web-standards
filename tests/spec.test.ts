import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { SpecView } from "../packages/render/src/index";
import {
  homeSpec,
  standardsSpec,
  projectSpec,
  projects,
  docsHomeSpec,
  componentDocs,
  componentSpec,
  getProject,
  projectCardsToElements,
  validateSpec,
} from "../packages/data/src/index";
test("all examples are valid catalog specs with resolved references", () => {
  for (const spec of [
    homeSpec(),
    standardsSpec(),
    docsHomeSpec(),
    ...projects.map(projectSpec),
    ...componentDocs.map((c) => componentSpec(c.slug)!),
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
  assert.equal(componentSpec("missing"), undefined);
});
test("real json-render SSR emits meaningful HTML and special slot content", () => {
  const html = renderToString(
    createElement(SpecView, { spec: projectSpec(projects[0]!) }),
  );
  assert.match(html, /Atlas 工作空间/);
  assert.match(html, /capacity-input/);
  assert.match(html, /HEADER|NAMED SLOT/);
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
