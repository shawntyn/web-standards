import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Button, Input, FormField, Grid } from "../packages/ui/src/index";
import { CapacityPlanner } from "../packages/render/src/components/capacity-planner";
const ui = new URL("../packages/ui/src/", import.meta.url);
test("UI public entry is a barrel and each component has its own source file", () => {
  const barrel = readFileSync(new URL("index.ts", ui), "utf8");
  assert.match(barrel, /export \{ Button \}/);
  assert.doesNotMatch(barrel, /function|<[A-Za-z]/);
  const files = readdirSync(new URL("components/", ui)).filter((file) =>
    file.endsWith(".tsx"),
  );
  assert.ok(files.length >= 19);
  for (const file of files) {
    const source = readFileSync(new URL(`components/${file}`, ui), "utf8");
    assert.equal((source.match(/export function /g) ?? []).length, 1, file);
  }
});
test("shared CSS contains only theme/base and no component selectors or apply", () => {
  const css = readFileSync(new URL("styles.css", ui), "utf8");
  assert.match(css, /@theme/);
  assert.match(css, /@layer base/);
  assert.doesNotMatch(css, /@apply|\.[a-zA-Z][\w-]*\s*[:{,>]/);
  assert.doesNotMatch(css, /\bh[123]\s*\{/);
  for (const file of readdirSync(new URL("components/", ui))) {
    const source = readFileSync(new URL(`components/${file}`, ui), "utf8");
    assert.doesNotMatch(
      source,
      /className="(?:card|button|stack|grid-cards|frame|slot-widget|muted)"/,
    );
  }
});
test("grid variants are complete Tailwind classes, no inline layout styles", () => {
  const html = renderToString(createElement(Grid, { columns: 4 }, "Content"));
  assert.match(html, /min-\[851px\]:grid-cols-4/);
  assert.doesNotMatch(html, /style=/);
});
test("form primitives retain native semantics and accessible errors", () => {
  const html = renderToString(
    createElement(
      FormField,
      {
        htmlFor: "name",
        label: "Name",
        error: "Required",
      },
      createElement(Input, {
        id: "name",
        required: true,
        "aria-invalid": true,
        "aria-describedby": "name-error",
      }),
    ),
  );
  assert.match(html, /for="name"/);
  assert.match(html, /id="name-error" role="alert"/);
  assert.match(html, /aria-invalid="true"/);
  const button = renderToString(
    createElement(Button, { disabled: true }, "Save"),
  );
  assert.match(button, /type="button"/);
  assert.match(button, /disabled=""/);
});
test("special slot uses unique input ids and only numeric CSS variable styling", () => {
  const html = renderToString(
    createElement(
      "div",
      null,
      createElement(CapacityPlanner, { initial: 20 }),
      createElement(CapacityPlanner, { initial: 40 }),
    ),
  );
  const ids = [...html.matchAll(/id="(capacity-input-[^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(ids).size, 2);
  assert.match(html, /--capacity:20%/);
  assert.match(html, /w-\[var\(--capacity\)\]/);
});
